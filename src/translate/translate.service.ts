// translate.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslateService {
  private cache = new Map<string, string>();

  /**
   * Translate any text from a source language to a target language
   * @param text string to translate
   * @param to target language code, e.g., 'ar', 'pt', 'zh'
   * @param source source language code, defaults to 'en'
   * @returns translated string
   */
  async translate(
    text: string,
    to: string,
    source: string = 'en',
  ): Promise<string> {
    const cacheKey = `${source}:${to}:${text}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: source,
        target: to,
        format: 'text',
      });

      const translated = response.data.translatedText;
      this.cache.set(cacheKey, translated);
      return translated;
    } catch (error) {
      console.error('Translation error:', error.message);
      return text; // fallback: return original text
    }
  }

  /**
   * Translate multiple texts in batch
   * @param texts array of strings to translate
   * @param to target language code
   * @param source source language code, defaults to 'en'
   * @returns array of translated strings
   */
  async translateBatch(
    texts: string[],
    to: string,
    source: string = 'en',
  ): Promise<string[]> {
    const translations = await Promise.all(
      texts.map((text) => this.translate(text, to, source)),
    );
    return translations;
  }

  /**
   * Get cache statistics
   * @returns object with cache size and keys
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clear the translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
