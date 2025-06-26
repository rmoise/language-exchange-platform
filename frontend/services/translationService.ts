import { api } from '@/utils/api';
import { 
  TranslateRequest, 
  TranslateResponse, 
  LanguagesResponse,
  SupportedLanguage,
  TranslationCacheEntry
} from '@/features/messaging/types';

export class TranslationService {
  private static cache = new Map<string, TranslationCacheEntry>();
  private static readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds
  private static supportedLanguages: SupportedLanguage[] = [];

  /**
   * Translate text from one language to another
   */
  static async translate(request: TranslateRequest): Promise<TranslateResponse> {
    // Validate request
    if (!request.text?.trim()) {
      throw new Error('Text is required for translation');
    }

    // Only check for same language if source is not 'auto'
    if (request.source_lang !== 'auto' && request.source_lang === request.target_lang) {
      console.warn('Source and target languages are the same:', request.source_lang);
      throw new Error('Source and target languages cannot be the same');
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(request.text, request.source_lang, request.target_lang);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached.translation;
    }

    try {
      console.log('Sending translation API request:', request);
      console.log('Request details:', {
        text: request.text,
        source_lang: request.source_lang,
        target_lang: request.target_lang
      });
      const response = await api.post('/translate', request);
      console.log('API response:', response.data);
      console.log('Full response structure:', JSON.stringify(response.data, null, 2));
      // The backend wraps the response in a data object
      const translationResponse = response.data.data as TranslateResponse;

      // Cache the result
      this.addToCache(cacheKey, translationResponse);

      return translationResponse;
    } catch (error: any) {
      console.error('API Error:', error.response?.status, error.response?.data);
      console.error('Failed request was:', request);
      if (error.response?.data) {
        console.error('Error details:', {
          message: error.response.data.message,
          error: error.response.data.error,
          code: error.response.data.code
        });
      }
      // Handle specific API errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle unsupported language pair error from LibreTranslate
        if (errorData.message && errorData.message.includes('is not available as a target language')) {
          // Return original text with a note about unsupported translation
          return {
            original_text: request.text,
            translated_text: `[Translation not available for ${request.source_lang} → ${request.target_lang}]`,
            source_lang: request.source_lang,
            target_lang: request.target_lang,
            provider: 'libretranslate'
          };
        }
        
        throw new Error(errorData.message || 'Translation failed');
      }
      
      throw new Error('Translation service is currently unavailable');
    }
  }

  /**
   * Get list of supported languages
   */
  static async getSupportedLanguages(): Promise<LanguagesResponse> {
    // Return cached languages if available
    if (this.supportedLanguages.length > 0) {
      return { languages: this.supportedLanguages };
    }

    try {
      const response = await api.get('/translate/languages');
      const languagesResponse = response.data as LanguagesResponse;
      
      // Cache the languages
      this.supportedLanguages = languagesResponse.languages;
      
      return languagesResponse;
    } catch (error: any) {
      // Return fallback languages if API fails
      const fallbackLanguages: SupportedLanguage[] = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'nl', name: 'Dutch' },
        { code: 'sv', name: 'Swedish' },
        { code: 'da', name: 'Danish' },
        { code: 'no', name: 'Norwegian' },
        { code: 'fi', name: 'Finnish' },
        { code: 'pl', name: 'Polish' },
        { code: 'tr', name: 'Turkish' },
        { code: 'he', name: 'Hebrew' },
      ];

      this.supportedLanguages = fallbackLanguages;
      
      return { languages: fallbackLanguages };
    }
  }

  /**
   * Check if a language is supported
   */
  static async isLanguageSupported(languageCode: string): Promise<boolean> {
    try {
      const response = await api.get(`/translate/languages/check?lang=${languageCode}`);
      return response.data.supported;
    } catch (error) {
      // Fallback check
      const languages = await this.getSupportedLanguages();
      return languages.languages.some(lang => lang.code.toLowerCase() === languageCode.toLowerCase());
    }
  }

  /**
   * Check translation service health
   */
  static async checkHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await api.get('/translate/health');
      return response.data;
    } catch (error: any) {
      return {
        status: 'unhealthy',
        message: error.response?.data?.message || 'Translation service is unavailable'
      };
    }
  }

  /**
   * Get translation service info
   */
  static async getServiceInfo(): Promise<any> {
    try {
      const response = await api.get('/translate/info');
      return response.data;
    } catch (error) {
      return {
        provider: 'unknown',
        max_text_length: 5000,
        description: 'Translation service information unavailable'
      };
    }
  }

  /**
   * Clear the translation cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxAge: number } {
    this.clearExpiredCache();
    
    let oldestEntry = Date.now();
    this.cache.forEach((entry) => {
      oldestEntry = Math.min(oldestEntry, entry.timestamp);
    });
    
    return {
      size: this.cache.size,
      maxAge: Date.now() - oldestEntry
    };
  }

  // Private helper methods

  private static generateCacheKey(text: string, sourceLang: string, targetLang: string): string {
    // Create a simple hash-like key for caching
    const textHash = this.simpleHash(text.toLowerCase().trim());
    return `${textHash}:${sourceLang.toLowerCase()}:${targetLang.toLowerCase()}`;
  }

  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private static getFromCache(key: string): TranslationCacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  private static addToCache(key: string, translation: TranslateResponse): void {
    const entry: TranslationCacheEntry = {
      key,
      translation,
      timestamp: Date.now()
    };

    this.cache.set(key, entry);

    // Limit cache size (keep only 500 most recent entries)
    if (this.cache.size > 500) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      // Keep only the 400 most recent entries
      this.cache.clear();
      entries.slice(0, 400).forEach(([k, v]) => {
        this.cache.set(k, v);
      });
    }
  }

  /**
   * Helper function to detect language from text (basic implementation)
   * This is a simple heuristic - for production use, consider a proper language detection library
   */
  static detectLanguage(text: string): string {
    // Very basic language detection based on character patterns
    const cleanText = text.toLowerCase().trim();
    
    // Check for common English words
    if (/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/.test(cleanText)) {
      return 'en';
    }
    
    // Check for Spanish patterns
    if (/[ñáéíóúü]/.test(cleanText) || /\b(el|la|los|las|de|del|en|con|por|para)\b/.test(cleanText)) {
      return 'es';
    }
    
    // Check for French patterns
    if (/[àâäéèêëîïôöùûüÿç]/.test(cleanText) || /\b(le|la|les|de|du|des|et|ou|avec|pour|dans)\b/.test(cleanText)) {
      return 'fr';
    }
    
    // Check for German patterns
    if (/[äöüß]/.test(cleanText) || /\b(der|die|das|und|oder|mit|für|in|auf|von)\b/.test(cleanText)) {
      return 'de';
    }
    
    // Check for Japanese (hiragana, katakana, kanji)
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanText)) {
      return 'ja';
    }
    
    // Check for Korean
    if (/[\uAC00-\uD7AF]/.test(cleanText)) {
      return 'ko';
    }
    
    // Check for Chinese
    if (/[\u4E00-\u9FFF]/.test(cleanText)) {
      return 'zh';
    }
    
    // Check for Arabic
    if (/[\u0600-\u06FF]/.test(cleanText)) {
      return 'ar';
    }
    
    // Check for Russian/Cyrillic
    if (/[\u0400-\u04FF]/.test(cleanText)) {
      return 'ru';
    }
    
    // Default to English
    return 'en';
  }

  /**
   * Format language code to full name
   */
  static async getLanguageName(code: string): Promise<string> {
    const languages = await this.getSupportedLanguages();
    const language = languages.languages.find(lang => lang.code.toLowerCase() === code.toLowerCase());
    return language?.name || code.toUpperCase();
  }

  /**
   * Simple wrapper method for text translation (for compatibility)
   */
  static async translateText(
    text: string, 
    sourceLang: string, 
    targetLang: string
  ): Promise<{ translatedText: string }> {
    try {
      console.log('Translation request:', { text, sourceLang, targetLang });
      
      // Normalize language codes
      const normalizedSource = sourceLang.toLowerCase();
      const normalizedTarget = targetLang.toLowerCase();
      
      // Skip translation for very short text that might be noise
      if (text.trim().length <= 1) {
        console.log('Text too short for translation');
        return {
          translatedText: text
        };
      }
      
      // More specific language code checking - only skip if truly the same
      const isSameLanguage = (
        normalizedSource === normalizedTarget ||
        (normalizedSource === 'en' && normalizedTarget === 'eng') ||
        (normalizedSource === 'eng' && normalizedTarget === 'en') ||
        (normalizedSource === 'de' && normalizedTarget === 'deu') ||
        (normalizedSource === 'deu' && normalizedTarget === 'de')
      );
      
      if (isSameLanguage) {
        console.log('Same language detected, returning original text with language tag');
        return {
          translatedText: `(${normalizedSource}) ${text}`
        };
      }
      
      // Force language detection for problematic cases
      // If source is detected as 'eng' but text looks German, force German detection
      let finalSourceLang = normalizedSource;
      console.log('Original source language:', normalizedSource, 'for text:', text);
      
      if (normalizedSource === 'eng' || normalizedSource === 'en') {
        const germanPattern = /\b(der|die|das|und|oder|mit|für|in|auf|von|zu|ist|war|bin|sind|hat|haben|sein|werden|wird|wurde|ein|eine|einer|ich|du|er|sie|es|wir|ihr|mein|dein|sein|ihr|unser|euer|dieser|diese|dieses|alle|viele|mehr|auch|noch|schon|immer|heute|morgen|gestern|hier|dort|wo|wann|wie|was|wer|warum|nicht|kein|keine|können|sollen|müssen|wollen|dürfen|mögen|warten|gehen|kommen|sehen|sagen|machen|geben|nehmen|finden|denken|fühlen|leben|arbeiten|spielen|sprechen|hören|lesen|schreiben|essen|trinken|schlafen|wohnen|fahren|laufen|unterricht|schule|lernen|student|lehrer|buch|haus|auto|zeit|jahr|tag|nacht|mann|frau|kind|familie|freund|liebe|arbeit|geld|land|stadt|welt|leben|wasser|essen|trinken|gut|schlecht|groß|klein|neu|alt|jung|schön|schwer|leicht|schnell|langsam|hoch|niedrig|weiß|schwarz|rot|blau|grün|gelb)\b/i;
        
        console.log('Testing German pattern against:', text.toLowerCase());
        const isGermanMatch = germanPattern.test(text.toLowerCase());
        console.log('German pattern match result:', isGermanMatch);
        
        if (isGermanMatch) {
          console.log('FORCING German source language for:', text);
          finalSourceLang = 'de';
        }
      }
      
      console.log('Final source language after checks:', finalSourceLang);
      
      const request: TranslateRequest = {
        text: text.trim(),
        source_lang: finalSourceLang,
        target_lang: normalizedTarget
      };
      
      const response = await this.translate(request);
      console.log('Translation response:', response);
      console.log('Checking translated_text field:', response.translated_text);
      
      const translatedText = response.translated_text?.trim();
      
      // If translation is empty, return error message
      if (!translatedText) {
        console.warn('Translation returned empty text');
        return {
          translatedText: `[Translation failed: ${text}]`
        };
      }
      
      // If translation is exactly the same as input and we forced a different source language, 
      // it likely means the original detection was correct and translation failed
      if (translatedText === text.trim() && finalSourceLang !== normalizedSource) {
        console.warn('Translation with forced language returned same text, trying with original detection');
        // Retry with original source language
        const retryRequest: TranslateRequest = {
          text: text.trim(),
          source_lang: normalizedSource,
          target_lang: normalizedTarget
        };
        
        try {
          const retryResponse = await this.translate(retryRequest);
          const retryTranslatedText = retryResponse.translated_text?.trim();
          
          if (retryTranslatedText && retryTranslatedText !== text.trim()) {
            return {
              translatedText: retryTranslatedText
            };
          }
        } catch (retryError) {
          console.warn('Retry translation failed:', retryError);
        }
      }
      
      // If translation is exactly the same as input, it might indicate detection issues
      if (translatedText === text.trim()) {
        console.warn('Translation returned identical text - likely same language or detection failure');
        return {
          translatedText: `(auto-detected same) ${text}`
        };
      }
      
      return {
        translatedText: translatedText
      };
    } catch (error: any) {
      console.error('Translation error:', error);
      
      // If it's an unsupported language pair, show a clearer message
      if (error.message && error.message.includes('Translation not available')) {
        return {
          translatedText: `[Cannot translate from ${sourceLang} to ${targetLang}]`
        };
      }
      
      // Return error message instead of original text to make issues visible
      return {
        translatedText: `[Translation Error: ${text}]`
      };
    }
  }
}

// Export an instance for easier usage
export const translationService = TranslationService;