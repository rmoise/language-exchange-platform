export interface OCRResult {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface TextRegion {
  id: string;
  originalText: string;
  translatedText?: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  detectedLanguage?: string;
}

export interface ImageTranslationState {
  isOpen: boolean;
  imageUrl: string | null;
  isProcessing: boolean;
  ocrProgress: number;
  textRegions: TextRegion[];
  selectedRegion: string | null;
  error: string | null;
}

export interface WordDetails {
  word: string;
  translation: string;
  partOfSpeech?: string;
  pronunciation?: string;
  definition?: string;
  examples?: string[];
}