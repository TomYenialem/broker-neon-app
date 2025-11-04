// translate.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslateService {
  /**
   * Translate any text from English (en) to a target language
   * @param text string to translate
   * @param to target language code, e.g., 'ar', 'pt', 'zh'
   * @returns translated string
   */
  async translate(text: string, to: string): Promise<string> {
    try {
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: 'en',
        target: to,
        format: 'text',
      });

      return response.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error.message);
      return text; // fallback: return original text
    }
  }
}
