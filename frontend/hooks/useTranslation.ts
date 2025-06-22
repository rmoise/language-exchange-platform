import { useState, useCallback, useRef, useEffect } from 'react';
import { TranslationService } from '@/services/translationService';
import { 
  TranslateRequest, 
  TranslateResponse, 
  MessageTranslation,
  SupportedLanguage
} from '@/features/messaging/types';

interface UseTranslationOptions {
  defaultSourceLang?: string;
  defaultTargetLang?: string;
  autoDetectSource?: boolean;
  enableCaching?: boolean;
}

interface UseTranslationReturn {
  translate: (text: string, sourceLang?: string, targetLang?: string) => Promise<TranslateResponse>;
  translateMessage: (messageId: string, text: string, sourceLang?: string, targetLang?: string) => Promise<void>;
  getMessageTranslation: (messageId: string) => MessageTranslation | null;
  clearMessageTranslation: (messageId: string) => void;
  clearAllTranslations: () => void;
  isTranslating: boolean;
  error: string | null;
  supportedLanguages: SupportedLanguage[];
  loadSupportedLanguages: () => Promise<void>;
  setDefaultLanguages: (sourceLang: string, targetLang: string) => void;
  messageTranslations: Map<string, MessageTranslation>;
}

export function useTranslation(options: UseTranslationOptions = {}): UseTranslationReturn {
  const {
    defaultSourceLang = 'en',
    defaultTargetLang = 'es',
    autoDetectSource = false,
    enableCaching = true
  } = options;

  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [messageTranslations, setMessageTranslations] = useState<Map<string, MessageTranslation>>(new Map());
  
  // Use refs for default languages so they can be updated
  const sourceLangRef = useRef(defaultSourceLang);
  const targetLangRef = useRef(defaultTargetLang);

  // Load supported languages on mount
  useEffect(() => {
    loadSupportedLanguages();
  }, []);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const setDefaultLanguages = useCallback((sourceLang: string, targetLang: string) => {
    sourceLangRef.current = sourceLang;
    targetLangRef.current = targetLang;
  }, []);

  const loadSupportedLanguages = useCallback(async () => {
    try {
      const response = await TranslationService.getSupportedLanguages();
      setSupportedLanguages(response.languages);
    } catch (err: any) {
      console.warn('Failed to load supported languages:', err.message);
      // Keep any existing languages or use empty array
    }
  }, []);

  const translate = useCallback(async (
    text: string, 
    sourceLang?: string, 
    targetLang?: string
  ): Promise<TranslateResponse> => {
    setError(null);
    setIsTranslating(true);

    try {
      // Use provided languages or defaults
      let finalSourceLang = sourceLang || sourceLangRef.current;
      const finalTargetLang = targetLang || targetLangRef.current;

      // Auto-detect source language if enabled and not provided
      if (autoDetectSource && !sourceLang) {
        finalSourceLang = TranslationService.detectLanguage(text);
      }

      const request: TranslateRequest = {
        text: text.trim(),
        source_lang: finalSourceLang,
        target_lang: finalTargetLang
      };

      const response = await TranslationService.translate(request);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Translation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  }, [autoDetectSource]);

  const translateMessage = useCallback(async (
    messageId: string,
    text: string,
    sourceLang?: string,
    targetLang?: string
  ): Promise<void> => {
    // Check if already translating this message
    const existingTranslation = messageTranslations.get(messageId);
    if (existingTranslation?.isLoading) {
      return;
    }

    // Use provided languages or defaults
    let finalSourceLang = sourceLang || sourceLangRef.current;
    const finalTargetLang = targetLang || targetLangRef.current;

    // Auto-detect source language if enabled and not provided
    if (autoDetectSource && !sourceLang) {
      finalSourceLang = TranslationService.detectLanguage(text);
    }

    // Set loading state
    const loadingTranslation: MessageTranslation = {
      messageId,
      originalText: text,
      translatedText: '',
      sourceLang: finalSourceLang,
      targetLang: finalTargetLang,
      isLoading: true
    };

    setMessageTranslations(prev => {
      const newMap = new Map(prev);
      newMap.set(messageId, loadingTranslation);
      return newMap;
    });

    try {
      const response = await translate(text, finalSourceLang, finalTargetLang);

      const completedTranslation: MessageTranslation = {
        messageId,
        originalText: text,
        translatedText: response.translated_text,
        sourceLang: response.source_lang,
        targetLang: response.target_lang,
        isLoading: false
      };

      setMessageTranslations(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, completedTranslation);
        return newMap;
      });
    } catch (err: any) {
      const errorTranslation: MessageTranslation = {
        messageId,
        originalText: text,
        translatedText: '',
        sourceLang: finalSourceLang,
        targetLang: finalTargetLang,
        isLoading: false,
        error: err.message
      };

      setMessageTranslations(prev => {
        const newMap = new Map(prev);
        newMap.set(messageId, errorTranslation);
        return newMap;
      });
    }
  }, [messageTranslations, translate, autoDetectSource]);

  const getMessageTranslation = useCallback((messageId: string): MessageTranslation | null => {
    return messageTranslations.get(messageId) || null;
  }, [messageTranslations]);

  const clearMessageTranslation = useCallback((messageId: string) => {
    setMessageTranslations(prev => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });
  }, []);

  const clearAllTranslations = useCallback(() => {
    setMessageTranslations(new Map());
    setError(null);
  }, []);

  return {
    translate,
    translateMessage,
    getMessageTranslation,
    clearMessageTranslation,
    clearAllTranslations,
    isTranslating,
    error,
    supportedLanguages,
    loadSupportedLanguages,
    setDefaultLanguages,
    messageTranslations
  };
}

// Hook for managing user's translation preferences
interface UseTranslationPreferencesReturn {
  sourceLanguage: string;
  targetLanguage: string;
  autoTranslate: boolean;
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  setAutoTranslate: (enabled: boolean) => void;
  swapLanguages: () => void;
  savePreferences: () => void;
  loadPreferences: () => void;
}

export function useTranslationPreferences(): UseTranslationPreferencesReturn {
  const [sourceLanguage, setSourceLanguageState] = useState('en');
  const [targetLanguage, setTargetLanguageState] = useState('es');
  const [autoTranslate, setAutoTranslateState] = useState(false);

  const STORAGE_KEY = 'translation-preferences';

  useEffect(() => {
    loadPreferences();
  }, []);

  const savePreferences = useCallback(() => {
    const preferences = {
      sourceLanguage,
      targetLanguage,
      autoTranslate
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [sourceLanguage, targetLanguage, autoTranslate]);

  const loadPreferences = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        setSourceLanguageState(preferences.sourceLanguage || 'en');
        setTargetLanguageState(preferences.targetLanguage || 'es');
        setAutoTranslateState(preferences.autoTranslate || false);
      }
    } catch (error) {
      console.warn('Failed to load translation preferences:', error);
    }
  }, []);

  const setSourceLanguage = useCallback((lang: string) => {
    setSourceLanguageState(lang);
  }, []);

  const setTargetLanguage = useCallback((lang: string) => {
    setTargetLanguageState(lang);
  }, []);

  const setAutoTranslate = useCallback((enabled: boolean) => {
    setAutoTranslateState(enabled);
  }, []);

  const swapLanguages = useCallback(() => {
    const temp = sourceLanguage;
    setSourceLanguageState(targetLanguage);
    setTargetLanguageState(temp);
  }, [sourceLanguage, targetLanguage]);

  // Auto-save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [savePreferences]);

  return {
    sourceLanguage,
    targetLanguage,
    autoTranslate,
    setSourceLanguage,
    setTargetLanguage,
    setAutoTranslate,
    swapLanguages,
    savePreferences,
    loadPreferences
  };
}