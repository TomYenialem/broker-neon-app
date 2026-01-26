import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { ListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import {
  buildChatMessages,
  ConversationHistoryMessage,
} from './prompt/chat-prompt.util';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly openAI: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    this.openAI = new OpenAI({
      apiKey: configService.getOrThrow<string>('OPENAI_API_KEY'),
    });
  }

  async sendChatMessage(userId: string, dto: CreateChatMessageDto) {
    const conversation = dto.conversationId
      ? await this.prisma.conversation.findFirst({
          where: { id: dto.conversationId, userId },
        })
      : null;

    if (dto.conversationId && !conversation) {
      throw new ForbiddenException('Conversation not found');
    }

    const activeConversation =
      conversation ??
      (await this.prisma.conversation.create({
        data: { userId },
      }));

    const historyRecords = await this.prisma.message.findMany({
      where: { conversationId: activeConversation.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    const history: ConversationHistoryMessage[] = historyRecords
      .filter((message) => message.role !== 'system')
      .map<ConversationHistoryMessage>((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      }))
      .reverse();

    const listings = await this.fetchListings(dto.filters);

    const messages = buildChatMessages(listings, history, dto.userMessage);

    let assistantMessage: string | undefined;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await this.openAI.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.2,
          max_tokens: 600,
        },
        { signal: controller.signal },
      );

      assistantMessage = response.choices[0]?.message?.content?.trim();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error('OpenAI completion timed out');
        throw new InternalServerErrorException(
          'AI response timed out, please try again.',
        );
      }

      this.logger.error(
        'OpenAI completion failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Unable to generate response currently',
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!assistantMessage) {
      this.logger.error('OpenAI returned empty message');
      throw new InternalServerErrorException('Failed to generate response');
    }

    await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId: activeConversation.id,
          role: 'user',
          content: dto.userMessage,
        },
      }),
      this.prisma.message.create({
        data: {
          conversationId: activeConversation.id,
          role: 'assistant',
          content: assistantMessage,
        },
      }),
    ]);

    return {
      conversationId: activeConversation.id,
      message: assistantMessage,
      listings,
    };
  }

  private async fetchListings(filters?: CreateChatMessageDto['filters']) {
    const where: Prisma.ListingWhereInput = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    } else {
      where.status = ListingStatus.ACTIVE;
    }

    if (filters?.province) {
      where.province = { contains: filters.province, mode: 'insensitive' };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const priceFilter: Prisma.FloatNullableFilter = {};
      if (filters.minPrice !== undefined) {
        priceFilter.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        priceFilter.lte = filters.maxPrice;
      }
      where.price = priceFilter;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { province: { contains: filters.search, mode: 'insensitive' } },
        { municipality: { contains: filters.search, mode: 'insensitive' } },
        { neighborhood: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const take = filters?.limit ?? 5;

    return this.prisma.listing.findMany({
      where,
      take,
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    });
  }
}
