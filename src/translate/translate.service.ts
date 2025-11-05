// translate.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface TranslationCache {
  [key: string]: string;
}

@Injectable()
export class TranslateService {
  private cache: TranslationCache = {};
  private readonly CACHE_PREFIX = 'translate';

  /**
   * Generate cache key
   */
  private getCacheKey(text: string, to: string): string {
    return `${this.CACHE_PREFIX}:${to}:${text}`;
  }

  /**
   * Translate any text from English (en) to a target language
   * @param text string to translate
   * @param to target language code, e.g., 'pt', 'zh'
   * @param source source language code, default 'en'
   * @returns translated string
   */
  async translate(text: string, to: string, source: string = 'en'): Promise<string> {
    // If target language is English, return original text
    if (to === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, to);
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await axios.post(
        'https://libretranslate.de/translate',
        {
          q: text,
          source,
          target: to,
          format: 'text',
        },
        {
          timeout: 10000, // 10s timeout
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: (status) => status === 200,
        },
      );

      // Validate response structure
      if (
        !response.data ||
        typeof response.data.translatedText !== 'string'
      ) {
        console.error('Invalid translation response structure');
        return text;
      }

      const translatedText = response.data.translatedText;

      // Store in cache
      this.cache[cacheKey] = translatedText;

      return translatedText;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('Translation request timeout');
        } else if (error.response) {
          console.error(
            `Translation API error: ${error.response.status} ${error.response.statusText}`,
          );
        } else {
          console.error('Translation error:', error.message);
        }
      } else {
        console.error('Unexpected translation error:', error);
      }
      return text; // fallback: return original text
    }
  }

  /**
   * Batch translate multiple texts
   * @param texts array of strings to translate
   * @param to target language code
   * @param source source language code, default 'en'
   * @returns array of translated strings
   */
  async translateBatch(
    texts: string[],
    to: string,
    source: string = 'en',
  ): Promise<string[]> {
    // If target language is English, return original texts
    if (to === 'en') {
      return texts;
    }

    const translations: string[] = [];
    
    for (const text of texts) {
      const translated = await this.translate(text, to, source);
      translations.push(translated);
    }

    return translations;
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    const keys = Object.keys(this.cache);
    return {
      size: keys.length,
      keys: keys.slice(0, 10), // Return first 10 keys as sample
    };
  }
}
