// translate.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  async translateText(
    @Body('text') text: string,
    @Body('to') to: string,
    @Body('source') source?: string,
  ): Promise<{ translated: string }> {
    const translated = await this.translateService.translate(
      text,
      to,
      source || 'en',
    );
    return { translated };
  }

  @Post('batch')
  async translateBatch(
    @Body('texts') texts: string[],
    @Body('to') to: string,
    @Body('source') source?: string,
  ): Promise<{ translations: string[] }> {
    const translations = await this.translateService.translateBatch(
      texts,
      to,
      source || 'en',
    );
    return { translations };
  }

  @Get('cache-stats')
  getCacheStats(): { size: number; keys: string[] } {
    return this.translateService.getCacheStats();
  }

  @Post('clear-cache')
  clearCache(): { message: string } {
    this.translateService.clearCache();
    return { message: 'Cache cleared successfully' };
  }
}
