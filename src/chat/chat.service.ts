import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import {
  Listing,
  ListingCategory,
  ListingStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import {
  buildChatMessages,
  ConversationHistoryMessage,
  ListingStatsSummary,
} from './prompt/chat-prompt.util';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly openAI: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    // ✅ OpenRouter Integration
    this.openAI = new OpenAI({
      apiKey: configService.getOrThrow<string>('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1', // OpenRouter base URL
    });
  }

  async sendChatMessage(userId: string, dto: CreateChatMessageDto) {
    // Check or create conversation
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

    // Fetch last 15 messages for context
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

    // Merge inferred filters from natural language prompt
    const normalizedFilters = this.mergeFiltersFromMessage(
      dto.userMessage,
      dto.filters,
    );

    // Fetch filtered listings
    const { listings, stats } = await this.fetchListings(normalizedFilters);

    // Build chat messages
    const messages = buildChatMessages(
      listings,
      history,
      dto.userMessage,
      stats,
    );

    // Generate AI response with timeout
    let assistantMessage: string | undefined;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await this.openAI.chat.completions.create(
        {
          model: 'openai/gpt-4o-mini', // OpenRouter compatible GPT-4o-mini
          messages,
          temperature: 0.2,
          max_tokens: 600,
        },
        { signal: controller.signal },
      );

      assistantMessage = response.choices[0]?.message?.content?.trim();
    } catch (error) {
      console.log('Error during OpenRouter completion:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.error('OpenRouter completion timed out');
        throw new InternalServerErrorException(
          'AI response timed out, please try again.',
        );
      }

      this.logger.error(
        'OpenRouter completion failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'Unable to generate response currently',
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!assistantMessage) {
      this.logger.error('OpenRouter returned empty message');
      throw new InternalServerErrorException('Failed to generate response');
    }

    // Save both user and assistant messages
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
      stats,
    };
  }

  private mergeFiltersFromMessage(
    userMessage: string,
    filters?: CreateChatMessageDto['filters'],
  ): CreateChatMessageDto['filters'] | undefined {
    const inferredCategory = this.inferCategoryFromMessage(userMessage);

    if (!filters) {
      return inferredCategory ? { category: inferredCategory } : undefined;
    }

    if (!filters.category && inferredCategory) {
      return { ...filters, category: inferredCategory };
    }

    return filters;
  }

  private inferCategoryFromMessage(
    userMessage: string,
  ): ListingCategory | undefined {
    const text = userMessage.toLowerCase();

    if (/(car|cars|vehicle|vehicles|auto|automobile|suv|truck)/.test(text)) {
      return ListingCategory.CAR;
    }

    if (
      /(house|home|homes|villa|apartment|condo|residence|property|properties)/.test(
        text,
      )
    ) {
      return ListingCategory.HOUSE;
    }

    if (/(land|plot|plots|farm|acre|acres|lot|terrain|site)/.test(text)) {
      return ListingCategory.LAND;
    }

    if (
      /(machine|machines|equipment|tractor|bulldozer|excavator|loader|plant)/.test(
        text,
      )
    ) {
      return ListingCategory.MACHINE;
    }

    return undefined;
  }

  // Fetch filtered listings
  private async fetchListings(
    filters?: CreateChatMessageDto['filters'],
  ): Promise<{
    listings: Listing[];
    stats: ListingStatsSummary;
  }> {
    const categories: ListingCategory[] = [
      ListingCategory.CAR,
      ListingCategory.HOUSE,
      ListingCategory.LAND,
      ListingCategory.MACHINE,
    ];

    const activeCounts = await this.prisma.listing.groupBy({
      by: ['category'],
      where: { status: ListingStatus.ACTIVE },
      _count: {
        _all: true,
      },
    });

    const stats: ListingStatsSummary = {
      totalActive: activeCounts.reduce(
        (sum, record) => sum + record._count._all,
        0,
      ),
      byCategory: categories.reduce(
        (acc, category) => {
          const match = activeCounts.find(
            (record) => record.category === category,
          );
          acc[category] = match?._count._all ?? 0;
          return acc;
        },
        {} as Record<ListingCategory, number>,
      ),
    };

    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.province) {
      where.province = { contains: filters.province, mode: 'insensitive' };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      const priceFilter: Prisma.FloatNullableFilter = {};
      if (filters.minPrice !== undefined) priceFilter.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceFilter.lte = filters.maxPrice;
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

    const orderBy: Prisma.ListingOrderByWithRelationInput[] = [
      { isFeatured: 'desc' },
      { updatedAt: 'desc' },
    ];

    if (!filters) {
      const grouped = await Promise.all(
        categories.map((category) =>
          this.prisma.listing.findMany({
            where: { ...where, category },
            take: 5,
            orderBy,
          }),
        ),
      );

      return { listings: grouped.flat(), stats };
    }

    const take = filters?.limit ?? 12;

    const listings = await this.prisma.listing.findMany({
      where,
      take,
      orderBy,
    });

    return { listings, stats };
  }
}
