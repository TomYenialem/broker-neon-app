// translate.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  async translateText(
    @Body('text') text: string,
    @Body('to') to: string,
  ): Promise<{ translated: string }> {
    const translated = await this.translateService.translate(text, to);
    return { translated };
  }
}
