"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Button,
  Popover,
} from '@mui/material';
import {
  ContentCopy,
  Translate,
  VolumeUp,
  BookmarkAdd,
  Close,
} from '@mui/icons-material';
import { createWorker, PSM } from 'tesseract.js';
import { TextRegion } from '../types';
import { translationService } from '@/services/translationService';
import { WordInteraction } from './WordInteraction';
import { FlashcardService } from '@/features/flashcards/flashcardService';
import { useAuth } from '@/hooks/useAuth';

interface TranslationDisplayProps {
  imageUrl: string;
  textRegions: TextRegion[];
  isProcessing: boolean;
  darkMode?: boolean;
  nativeLanguage: string;
}

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Map Tesseract language codes to standard language codes
const mapTesseractToStandardCode = (tesseractCode: string): string => {
  const reverseMap: Record<string, string> = {
    'eng': 'en',
    'spa': 'es',
    'fra': 'fr',
    'deu': 'de',
    'ita': 'it',
    'por': 'pt',
    'rus': 'ru',
    'jpn': 'ja',
    'kor': 'ko',
    'chi_sim': 'zh',
    'ara': 'ar',
    'hin': 'hi',
  };
  return reverseMap[tesseractCode] || 'en';
};

// Enhanced language detection based on character patterns and common words
const detectLanguageFromText = (text: string): string => {
  const cleanText = text.toLowerCase().trim();
  
  // Don't use text length as a limiting factor - even short words can be detected
  console.log('Detecting language for text:', text);
  
  // Common character patterns for different languages
  const patterns = {
    'deu': /[äöüßÄÖÜ]/,
    'fra': /[àâçèéêëîïôùûüÿÀÂÇÈÉÊËÎÏÔÙÛÜŸ]/,
    'spa': /[áéíóúñÁÉÍÓÚÑ¿¡]/,
    'ita': /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/,
    'por': /[ãõçáàâêéíóôúÃÕÇÁÀÂÊÉÍÓÔÚ]/,
    'rus': /[а-яА-Я]/,
    'jpn': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/,
    'kor': /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/,
    'chi_sim': /[\u4e00-\u9fff]/,
    'ara': /[\u0600-\u06ff]/,
    'hin': /[\u0900-\u097f]/,
  };
  
  // Enhanced German word patterns including words without special characters
  const wordPatterns = {
    'deu': /\b(der|die|das|und|oder|aber|mit|für|in|auf|von|zu|ist|war|bin|sind|hat|haben|sein|werden|wird|wurde|ein|eine|einer|ich|du|er|sie|es|wir|ihr|sie|mein|dein|sein|ihr|unser|euer|dieser|diese|dieses|alle|viele|mehr|auch|noch|schon|immer|heute|morgen|gestern|hier|dort|wo|wann|wie|was|wer|warum|nicht|kein|keine|können|sollen|müssen|wollen|dürfen|mögen|warten|gehen|kommen|sehen|sagen|machen|geben|nehmen|finden|denken|fühlen|leben|arbeiten|spielen|sprechen|hören|lesen|schreiben|essen|trinken|schlafen|wohnen|fahren|laufen|unterricht|schule|lernen|lehrer|student)\b/i,
    'fra': /\b(le|la|les|de|du|des|et|ou|avec|pour|dans|sur|par|est|était|sont|étaient|un|une|je|tu|il|elle|nous|vous|ils|elles|avoir|être|faire|aller|dire|voir|savoir|pouvoir|vouloir|venir|falloir|devoir|croire|trouver|donner|prendre|parler|aimer|porter|laisser|entendre|demander|rester|passer|regarder|suivre|connaître|paraître|sortir|tenir|mettre|montrer|écrire|vivre|partir|arriver|entrer|continuer|penser|tourner|revenir|porter|rappeler|devenir|ouvrir|commencer|finir|rendre|comprendre|attendre|répondre|tomber|naître)\b/i,
    'spa': /\b(el|la|los|las|de|del|en|con|por|para|es|está|son|están|fue|era|un|una|yo|tú|él|ella|nosotros|vosotros|ellos|ellas|ser|estar|tener|hacer|poder|decir|ir|ver|dar|saber|querer|llegar|pasar|deber|poner|parecer|quedar|creer|hablar|llevar|dejar|seguir|encontrar|llamar|venir|pensar|salir|volver|tomar|conocer|vivir|sentir|tratar|mirar|contar|empezar|esperar|buscar|existir|entrar|trabajar|escribir|perder|producir|ocurrir|entender|pedir|recibir|recordar|terminar|permitir|aparecer|conseguir|comenzar|servir|sacar|necesitar|mantener|resultar|leer|caer|cambiar|presentar|crear|abrir|considerar|oír|acabar|convertir|ganar|formar|traer|partir|morir|aceptar|realizar|suponer|comprender|lograr|explicar|preguntar|tocar|reconocer|estudiar|alcanzar|nacer|dirigir|correr|utilizar|pagar|ayudar|gustar|jugar|aumentar|producir|comer|vender)\b/i,
    'ita': /\b(il|la|le|lo|gli|di|del|della|delle|dei|degli|e|ed|o|od|con|per|in|su|da|tra|fra|è|sono|era|erano|un|una|io|tu|lui|lei|noi|voi|loro|essere|avere|fare|dire|andare|sapere|dare|stare|volere|dovere|potere|vedere|venire|uscire|parlare|mettere|portare|sentire|prendere|rimanere|credere|tenere|vivere|morire|partire|tornare|diventare|lasciare|entrare|guardare|trovare|pensare|chiamare|aspettare|portare|aprire|chiudere|iniziare|finire|continuare|smettere|cambiare|crescere|nascere|cadere|salire|scendere|correre|camminare|mangiare|bere|dormire|svegliare|lavorare|studiare|imparare|insegnare|comprare|vendere|pagare|costare|vincere|perdere|giocare|cantare|suonare|ballare|ridere|piangere|sorridere|amare|odiare|aiutare|ringraziare|scusare|perdonare)\b/i,
    'por': /\b(o|a|os|as|de|do|da|dos|das|e|ou|com|por|para|em|no|na|nos|nas|é|são|era|eram|foi|foram|um|uma|eu|tu|ele|ela|nós|vós|eles|elas|ser|estar|ter|haver|fazer|ir|vir|ver|dar|saber|poder|querer|dever|dizer|falar|pôr|ficar|levar|trazer|chegar|sair|entrar|subir|descer|cair|correr|andar|parar|começar|acabar|continuar|deixar|tirar|pegar|colocar|meter|botar|guardar|esconder|mostrar|olhar|ouvir|sentir|pensar|lembrar|esquecer|conhecer|encontrar|procurar|achar|perder|ganhar|vencer|morrer|nascer|viver|dormir|acordar|comer|beber|trabalhar|estudar|aprender|ensinar|ler|escrever|falar|cantar|tocar|jogar|brincar|sorrir|chorar|amar|gostar|odiar|ajudar|agradecer|desculpar|perdoar)\b/i,
    'eng': /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|this|that|these|those|is|are|was|were|be|been|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|a|an|some|any|all|each|every|no|not|very|more|most|much|many|few|little|good|bad|big|small|new|old|first|last|long|short|high|low|right|wrong|same|different|other|another|next|previous|here|there|where|when|how|what|who|why|because|if|although|unless|until|while|since|before|after|during|between|among|through|over|under|above|below|inside|outside|beside|near|far|left|right|up|down|front|back|top|bottom|begin|end|start|stop|come|go|get|give|take|make|see|look|hear|listen|say|tell|ask|answer|know|think|feel|want|need|like|love|hate|help|work|play|eat|drink|sleep|wake|live|die|born|grow|learn|teach|read|write|speak|talk|walk|run|sit|stand|lie|fall|rise|open|close|put|keep|hold|carry|bring|send|receive|buy|sell|pay|cost|win|lose|find|search|try|use|wear|wash|clean|cook|build|break|fix|cut|hit|push|pull|throw|catch|jump|dance|sing|laugh|cry|smile|happy|sad|angry|afraid|surprised|tired|hungry|thirsty|hot|cold|warm|cool|wet|dry|clean|dirty|easy|hard|fast|slow|quiet|loud|strong|weak|heavy|light|dark|bright|empty|full|open|closed|free|busy|rich|poor|young|old|beautiful|ugly|smart|stupid|kind|mean|nice|rude|polite|funny|serious|important|interesting|boring)\b/i,
  };
  
  // First check for non-Latin scripts (they are more distinctive)
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (['rus', 'jpn', 'kor', 'chi_sim', 'ara', 'hin'].includes(lang) && pattern.test(text)) {
      console.log(`Detected ${lang} based on script`);
      return lang;
    }
  }
  
  // Then check for Latin scripts with diacritics
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (['deu', 'fra', 'spa', 'ita', 'por'].includes(lang) && pattern.test(text)) {
      console.log(`Detected ${lang} based on diacritics`);
      return lang;
    }
  }
  
  // Check for common words to distinguish between similar languages
  // Score each language based on word matches
  const scores: Record<string, number> = {};
  
  for (const [lang, pattern] of Object.entries(wordPatterns)) {
    const matches = cleanText.match(pattern);
    scores[lang] = matches ? matches.length : 0;
  }
  
  // Find the language with the highest score
  let bestMatch = 'eng';
  let maxScore = 0;
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestMatch = lang;
    }
  }
  
  if (maxScore > 0) {
    console.log(`Detected ${bestMatch} based on ${maxScore} word matches, scores:`, scores);
    return bestMatch;
  }
  
  // For short text without clear indicators, use a more sophisticated approach
  // Check if it could be German by looking for German-like patterns
  if (cleanText.length <= 10) {
    // Common German words that don't have special characters
    if (/\b(wo|wer|wie|was|wann|warum|warten|werden|waren|war|morgen|heute|gestern|hier|dort|nach|vor|über|unter|neben|zwischen|durch|gegen|ohne|mit|bei|aus|zu|von|für|um|an|auf|in|der|die|das|den|dem|des|ein|eine|einer|ich|du|er|sie|es|wir|ihr|und|oder|aber|doch|noch|schon|auch|nur|sehr|mehr|alle|viele|wenige|keine|kein|nicht|nie|immer|oft|manchmal|heute|morgen|gestern|jetzt|dann|hier|dort|da|wo|wie|was|wer|wann|warum|wohin|woher|womit|wofür|wodurch|wobei|worauf|worüber|woraus|worin|worein|worunter|wonach|wovon|wozu|woran|womach|wovor|wohin|her|hin|raus|rein|runter|rauf|weg|zurück|mit|vor|nach|über|unter|neben|zwischen|durch|gegen|ohne|für|um|an|auf|in|bei|aus|zu|von|seit|bis|während|trotz|wegen|statt|außer|innerhalb|außerhalb|oberhalb|unterhalb|inmitten|anhand|aufgrund|infolge|mittels|bezüglich|hinsichtlich|entsprechend|gemäß|laut|zufolge|angesichts|anstelle|anstatt|ausschließlich|einschließlich|hinsichtlich|bezüglich|betreffs|zwecks|mangels|seitens|vonseiten|zugunsten|zulasten|zuungunsten)\b/i.test(cleanText)) {
      console.log('Detected German based on common German words without special characters');
      return 'deu';
    }
  }
  
  // Default to let Tesseract auto-detect
  console.log('No clear language pattern detected, letting Tesseract auto-detect');
  return 'auto';
};

export const TranslationDisplay: React.FC<TranslationDisplayProps> = ({
  imageUrl,
  textRegions,
  isProcessing,
  darkMode = false,
  nativeLanguage,
}) => {
  const { user } = useAuth();
  const [translatedRegions, setTranslatedRegions] = useState<TextRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [selectionHistory, setSelectionHistory] = useState<TextRegion[]>([]);

  // Select All functionality
  const handleSelectAll = async () => {
    if (!imageRef.current) return;
    
    const img = imageRef.current.querySelector('img');
    if (!img || !img.complete) return;

    // Create a selection box covering the entire image
    const rect = imageRef.current.getBoundingClientRect();
    const selectionBox = {
      startX: 0,
      startY: 0,
      endX: img.clientWidth,
      endY: img.clientHeight,
    };

    // Create anchor element for the popover
    const anchor = document.createElement('div');
    anchor.style.position = 'absolute';
    anchor.style.left = `${rect.left}px`;
    anchor.style.top = `${rect.top}px`;
    document.body.appendChild(anchor);

    setIsTranslatingSelection(true);

    try {
      // Perform OCR on the entire image
      const ocrResult = await performOCROnSelection(selectionBox);
      
      if (ocrResult.text.trim()) {
        // If OCR returned 'auto', use the translation service's language detection
        let sourceLanguage = ocrResult.detectedLanguage;
        if (sourceLanguage === 'auto') {
          // Let the translation API handle language auto-detection
          console.log('Using translation API auto-detection for:', ocrResult.text);
          sourceLanguage = 'auto';
        } else {
          sourceLanguage = mapTesseractToStandardCode(sourceLanguage);
        }
        
        // Always attempt translation unless explicitly the same language
        let translatedText = ocrResult.text;
        
        console.log('=== SELECT ALL DEBUG ===');
        console.log('OCR Text:', ocrResult.text);
        console.log('OCR Detected Language:', ocrResult.detectedLanguage);
        console.log('Mapped Source Language:', sourceLanguage);
        console.log('User Native Language:', nativeLanguage);
        console.log('Should Translate?:', sourceLanguage !== nativeLanguage);
        console.log('========================');
        
        if (sourceLanguage !== nativeLanguage) {
          try {
            console.log('=== ATTEMPTING TRANSLATION ===');
            console.log('Source:', sourceLanguage, 'Target:', nativeLanguage);
            
            const result = await translationService.translateText(
              ocrResult.text,
              sourceLanguage,   // detected language
              nativeLanguage    // user's native language
            );
            translatedText = result.translatedText;
            
            console.log('Select All Translation result:', {
              original: ocrResult.text,
              translated: translatedText,
              same: translatedText === ocrResult.text
            });
            console.log('==============================');
          } catch (error) {
            console.error('Translation failed:', error);
            translatedText = `[Translation Error: ${ocrResult.text}]`;
          }
        } else {
          console.log('=== SKIPPING TRANSLATION ===');
          console.log('Source:', sourceLanguage, 'Native:', nativeLanguage);
          console.log('Same language detected - no translation needed');
          console.log('============================');
          translatedText = `(${sourceLanguage}) ${ocrResult.text}`;
        }

        // Add to selection history
        const newRegion: TextRegion = {
          id: `selection-${Date.now()}`,
          originalText: ocrResult.text,
          bbox: { x: 0, y: 0, width: img.clientWidth, height: img.clientHeight },
          confidence: 95,
          detectedLanguage: ocrResult.detectedLanguage,
          translatedText: translatedText,
        };
        
        setSelectionHistory(prev => [newRegion, ...prev]);

        // Remove the anchor element since we're not showing a popover
        document.body.removeChild(anchor);
      } else {
        setSelectionPopover({
          anchor,
          text: 'No text detected',
          translation: 'Try selecting a specific text area instead',
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      setSelectionPopover({
        anchor,
        text: 'Error',
        translation: 'Failed to process image',
      });
    } finally {
      setIsTranslatingSelection(false);
    }
  };

  // Add keyboard shortcut for Select All
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        handleSelectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSelectAll]);
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [selectionPopover, setSelectionPopover] = useState<{
    anchor: HTMLElement | null;
    text: string;
    translation: string;
  } | null>(null);
  const [isTranslatingSelection, setIsTranslatingSelection] = useState(false);

  // Since we removed auto-detection, textRegions will always be empty
  // All translations now happen via selection only

  const handleCopyAll = () => {
    const allText = selectionHistory
      .map((r) => `${r.originalText} → ${r.translatedText || 'Translating...'}`)
      .join('\n\n');
    navigator.clipboard.writeText(allText);
  };

  // Handle drag selection
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setSelectionBox({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectionBox || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionBox({
      ...selectionBox,
      endX: x,
      endY: y,
    });
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectionBox || !imageRef.current) return;
    
    setIsDragging(false);
    
    // Check if selection is large enough
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);
    
    if (width < 10 || height < 10) {
      setSelectionBox(null);
      return;
    }
    
    const rect = imageRef.current.getBoundingClientRect();
    const anchor = document.createElement('div');
    anchor.style.position = 'absolute';
    anchor.style.left = `${rect.left + Math.min(selectionBox.startX, selectionBox.endX)}px`;
    anchor.style.top = `${rect.top + Math.min(selectionBox.startY, selectionBox.endY)}px`;
    document.body.appendChild(anchor);
    
    setIsTranslatingSelection(true);
    
    try {
      // Perform OCR on the selected region
      const ocrResult = await performOCROnSelection(selectionBox);
      
      if (ocrResult.text.trim()) {
        // If OCR returned 'auto', use the translation service's language detection
        let sourceLanguage = ocrResult.detectedLanguage;
        if (sourceLanguage === 'auto') {
          // Let the translation API handle language auto-detection
          console.log('Using translation API auto-detection for:', ocrResult.text);
          sourceLanguage = 'auto';
        } else {
          sourceLanguage = mapTesseractToStandardCode(sourceLanguage);
        }
        
        console.log('=== DRAG SELECTION DEBUG ===');
        console.log('OCR Text:', ocrResult.text);
        console.log('OCR Detected Language:', ocrResult.detectedLanguage);
        console.log('Mapped Source Language:', sourceLanguage);
        console.log('User Native Language:', nativeLanguage);
        console.log('Should Translate?:', sourceLanguage !== nativeLanguage);
        console.log('============================');
        
        let translatedText = ocrResult.text;
        
        // Always attempt translation unless explicitly the same language
        if (sourceLanguage !== nativeLanguage) {
          try {
            console.log('Attempting translation from', sourceLanguage, 'to', nativeLanguage);
            const result = await translationService.translateText(
              ocrResult.text,
              sourceLanguage,   // detected language
              nativeLanguage    // user's native language
            );
            
            translatedText = result.translatedText;
            
            console.log('Drag Selection Translation result:', {
              original: ocrResult.text,
              translated: translatedText,
              same: translatedText === ocrResult.text
            });
            
            // Translation successful - no popover needed
            translatedText = result.translatedText;
          } catch (error) {
            console.error('Translation failed:', error);
            translatedText = `[Translation Error: ${ocrResult.text}]`;
          }
        } else {
          console.log('Skipping translation: same language detected');
          translatedText = `(${sourceLanguage}) ${ocrResult.text}`;
        }
        
        // Add to selection history
        const newRegion: TextRegion = {
          id: `selection-${Date.now()}`,
          originalText: ocrResult.text,
          bbox: {
            x: Math.min(selectionBox.startX, selectionBox.endX),
            y: Math.min(selectionBox.startY, selectionBox.endY),
            width: Math.abs(selectionBox.endX - selectionBox.startX),
            height: Math.abs(selectionBox.endY - selectionBox.startY)
          },
          confidence: 90,
          detectedLanguage: ocrResult.detectedLanguage,
          translatedText: translatedText,
        };
        
        setSelectionHistory(prev => [newRegion, ...prev]);
        
        // Remove the anchor element since we're not showing a popover
        document.body.removeChild(anchor);
      } else {
        setSelectionPopover({
          anchor,
          text: 'No text detected',
          translation: 'Try selecting a larger area',
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      setSelectionPopover({
        anchor,
        text: 'Error',
        translation: 'Failed to process selection',
      });
    } finally {
      setIsTranslatingSelection(false);
    }
    
    setSelectionBox(null);
  };


  const handleClosePopover = () => {
    if (selectionPopover?.anchor) {
      document.body.removeChild(selectionPopover.anchor);
    }
    setSelectionPopover(null);
  };

  const handleSaveSelection = async () => {
    if (!user?.id || !selectionPopover) return;
    
    try {
      // Detect the source language from the text
      const detectedLang = translationService.detectLanguage(selectionPopover.text);
      
      await FlashcardService.quickSaveWord(
        user.id,
        selectionPopover.text,
        selectionPopover.translation,
        detectedLang,
        nativeLanguage,
        `From image selection: ${selectionPopover.text}`,
        'image-translation'
      );
    } catch (error) {
      console.error('Failed to save flashcard:', error);
    }
  };

  const speakText = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const performOCROnSelection = async (box: SelectionBox): Promise<{ text: string; detectedLanguage: string }> => {
    const img = imageRef.current?.querySelector('img');
    if (!img || !img.complete) return { text: '', detectedLanguage: 'eng' };

    // Create a canvas to crop the selected region
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { text: '', detectedLanguage: 'eng' };

    // Calculate the scale between displayed and natural image size
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    // Convert selection box coordinates to natural image coordinates
    const cropX = Math.min(box.startX, box.endX) * scaleX;
    const cropY = Math.min(box.startY, box.endY) * scaleY;
    const cropWidth = Math.abs(box.endX - box.startX) * scaleX;
    const cropHeight = Math.abs(box.endY - box.startY) * scaleY;

    // Enhanced canvas setup with significant upscaling for better OCR accuracy
    const scaleFactor = 3;
    canvas.width = cropWidth * scaleFactor;
    canvas.height = cropHeight * scaleFactor;

    // Apply image preprocessing for better OCR
    ctx.imageSmoothingEnabled = false;
    ctx.scale(scaleFactor, scaleFactor);
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the cropped region onto the canvas
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight, // Source rectangle
      0, 0, cropWidth, cropHeight // Destination rectangle
    );

    // Apply image enhancements
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const enhanced = enhanceImageForOCR(imageData);
    ctx.putImageData(enhanced, 0, 0);

    // Convert canvas to data URL
    const croppedImageUrl = canvas.toDataURL('image/png');

    // Following documentation: use multi-language worker directly for better detection
    // Create worker with multiple Latin languages for comprehensive detection
    let ocrWorker = null;
    try {
      // Use multi-language worker for Latin scripts (includes German detection)
      const latinLanguages = ['eng', 'deu', 'spa', 'fra', 'ita', 'por'];
      console.log('Creating multi-language OCR worker with languages:', latinLanguages);
      
      ocrWorker = await createWorker(latinLanguages, 1, {
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log('OCR Progress:', Math.round(m.progress * 100) + '%');
          }
        }
      });
      
      // Set OCR parameters for better accuracy
      await ocrWorker.setParameters({
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        tessedit_ocr_engine_mode: '1', // LSTM engine only
      });

      console.log('Performing OCR recognition on cropped image...');
      const { data } = await ocrWorker.recognize(croppedImageUrl);
      
      // Log the complete data structure to understand what Tesseract returns
      console.log('Complete Tesseract data structure:', data);
      
      // Based on documentation, when using multi-language worker, Tesseract 
      // should automatically use the most appropriate language from the set
      // Since we provided ['eng', 'deu', 'spa', 'fra', 'ita', 'por'], 
      // Tesseract should have chosen the best match
      
      // For multi-language workers, we need to trust Tesseract's internal language selection
      // The key insight is that with a multi-language worker, we don't override its choice
      let finalDetectedLang = 'eng'; // Default fallback
      
      // According to documentation, multi-language workers automatically select
      // the best language from the provided set during recognition
      // Since we provided ['eng', 'deu', 'spa', 'fra', 'ita', 'por'],
      // Tesseract should have used the most appropriate one
      // 
      // The documentation shows that for language detection, we should use 
      // a separate detect() method, but for our use case, we trust that
      // the multi-language worker has done its job correctly
      
      // Based on documentation pattern - when using multi-language worker,
      // we can assume the recognition used the most appropriate language
      // For now, we'll use a simple approach: if text was recognized with
      // high confidence, trust the multi-language selection
      
      finalDetectedLang = 'auto'; // Let the translation service handle language detection
      
      console.log('Multi-language OCR Result:', {
        text: data.text,
        detectedLanguage: finalDetectedLang,
        confidence: data.confidence,
        usedLanguages: latinLanguages,
        rawData: data
      });
      
      await ocrWorker.terminate();
      
      return {
        text: data.text.trim(),
        detectedLanguage: finalDetectedLang
      };
    } catch (error) {
      console.error('Multi-language OCR recognition failed:', error);
      if (ocrWorker) {
        try {
          await ocrWorker.terminate();
        } catch (terminateError) {
          console.error('Error terminating worker:', terminateError);
        }
      }
      return { text: '', detectedLanguage: 'eng' };
    }
  };


  // Image enhancement function for better OCR accuracy
  const enhanceImageForOCR = (imageData: ImageData): ImageData => {
    const data = imageData.data;

    // Convert to grayscale and apply moderate contrast
    // Avoid too aggressive thresholding which can remove umlaut dots
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Apply gentler contrast enhancement to preserve small details like umlaut dots
      let enhanced = ((gray - 128) * 1.2) + 128;
      enhanced = Math.max(0, Math.min(255, enhanced));
      
      // Use adaptive thresholding instead of fixed threshold
      // This helps preserve small features like dots
      let value;
      if (enhanced > 200) {
        value = 255; // White background
      } else if (enhanced < 50) {
        value = 0; // Black text
      } else {
        // Preserve mid-tones which might contain umlaut dots
        value = enhanced < 128 ? 0 : 255;
      }
      
      data[i] = value;     // Red
      data[i + 1] = value; // Green
      data[i + 2] = value; // Blue
      // Alpha remains unchanged
    }

    return imageData;
  };

  // Removed fixGermanOCRErrors function - relying on proper OCR configuration instead

  if (isProcessing) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 4,
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ mb: 2, color: '#6366f1' }} />
          <Typography variant="h6">Processing Image...</Typography>
          <Typography variant="body2" color="text.secondary">
            Detecting text in your image
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      {/* Image with drag selection */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Draw a box around text, click "Select All", or press Ctrl+A to translate the entire image
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
              sx={{
                color: '#6366f1',
                borderColor: '#6366f1',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderColor: '#5558d9',
                },
              }}
            >
              Select All
            </Button>
          </Stack>
        </Box>

        <Box
          ref={imageRef}
          sx={{
            position: 'relative',
            display: 'inline-block',
            backgroundColor: darkMode ? '#0f0f0f' : '#f5f5f5',
            borderRadius: 1,
            overflow: 'hidden',
            cursor: 'crosshair',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            src={imageUrl}
            alt="Processed"
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              pointerEvents: 'none',
            }}
            draggable={false}
          />

          {/* Selection box overlay */}
          {selectionBox && isDragging && (
            <Box
              sx={{
                position: 'absolute',
                left: Math.min(selectionBox.startX, selectionBox.endX),
                top: Math.min(selectionBox.startY, selectionBox.endY),
                width: Math.abs(selectionBox.endX - selectionBox.startX),
                height: Math.abs(selectionBox.endY - selectionBox.startY),
                border: '2px dashed #6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>
      </Box>

      {/* Translation panel */}
      <Box
        sx={{
          width: 400,
          borderLeft: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Selected Text</Typography>
            {selectionHistory.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Copy all translations">
                  <IconButton size="small" onClick={handleCopyAll}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box sx={{ 
          overflow: 'auto', 
          p: 2,
          paddingBottom: 25, // Massive bottom padding to ensure last item is fully visible
          maxHeight: 'calc(100vh - 60px)', // Maximum scroll space
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: darkMode ? '#1a1a1a' : '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: darkMode ? '#555' : '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: darkMode ? '#777' : '#a1a1a1',
          },
        }}>
          {isTranslating ? (
            <Box textAlign="center" py={4}>
              <CircularProgress size={32} sx={{ color: '#6366f1' }} />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Translating text...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {selectionHistory.map((region) => (
                <Paper
                  key={region.id}
                  elevation={selectedRegion === region.id ? 2 : 0}
                  sx={{
                    p: 2,
                    backgroundColor:
                      selectedRegion === region.id
                        ? darkMode
                          ? '#1a1a1a'
                          : '#f8f9ff'
                        : darkMode
                        ? '#0f0f0f'
                        : '#fafafa',
                    border: `1px solid ${
                      selectedRegion === region.id
                        ? '#6366f1'
                        : darkMode
                        ? '#333'
                        : '#e0e0e0'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#6366f1',
                    },
                  }}
                  onClick={() => setSelectedRegion(region.id)}
                >
                  <Stack spacing={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {region.originalText}
                    </Typography>
                    <Divider />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Translate fontSize="small" sx={{ color: '#6366f1' }} />
                      <Typography variant="body2" color="primary">
                        {region.translatedText || 'Translating...'}
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 1 }}>
                      <WordInteraction
                        word={region.originalText}
                        translation={region.translatedText || ''}
                        context={`Image translation: ${region.originalText}`}
                        targetLanguage={mapTesseractToStandardCode(region.detectedLanguage || 'eng')}
                        nativeLanguage={nativeLanguage}
                        darkMode={darkMode}
                      />
                    </Box>
                  </Stack>
                </Paper>
              ))}

              {selectionHistory.length === 0 && !isTranslating && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    No text selected yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Drag on the image to select text for translation
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      {/* Selection translation popover */}
      <Popover
        open={Boolean(selectionPopover)}
        anchorEl={selectionPopover?.anchor || null}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
              minWidth: 250,
              maxWidth: 350,
            },
          },
        }}
      >
        {isTranslatingSelection ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" mt={1}>Translating...</Typography>
          </Box>
        ) : selectionPopover && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={600}>
                Selected Text
              </Typography>
              <IconButton size="small" onClick={handleClosePopover}>
                <Close fontSize="small" />
              </IconButton>
            </Stack>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" fontWeight={500}>
                  {selectionPopover.text}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    // Detect language from the text for speaking
                    const detectedLang = translationService.detectLanguage(selectionPopover.text);
                    speakText(selectionPopover.text, detectedLang);
                  }}
                >
                  <VolumeUp fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Translate fontSize="small" sx={{ color: '#6366f1' }} />
                <Typography variant="body2" color="primary">
                  {selectionPopover.translation}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => speakText(selectionPopover.translation, nativeLanguage)}
                >
                  <VolumeUp fontSize="small" sx={{ color: '#6366f1' }} />
                </IconButton>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<ContentCopy fontSize="small" />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectionPopover.text} → ${selectionPopover.translation}`
                  );
                  handleClosePopover();
                }}
              >
                Copy
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<BookmarkAdd fontSize="small" />}
                onClick={() => {
                  handleSaveSelection();
                  handleClosePopover();
                }}
                sx={{
                  backgroundColor: '#6366f1',
                  '&:hover': { backgroundColor: '#5558d9' },
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        )}
      </Popover>
    </Box>
  );
};