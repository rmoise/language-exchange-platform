# Swipe-to-Reveal Translation Feature

## Overview

This document describes the implementation of the swipe-to-reveal translation feature that allows users to translate messages by swiping horizontally on message bubbles.

## Features

### ✨ Key Features
- **Gesture-based Translation**: Swipe right-to-left on any incoming message to reveal translation
- **Lazy Loading**: Translation API calls are only made when the user swipes or manually requests translation
- **Smooth Animations**: Framer Motion powers fluid reveal animations
- **Smart Caching**: Translations are cached to avoid duplicate API calls
- **Error Handling**: Graceful degradation when translation fails
- **Accessibility**: Full keyboard support and screen reader compatibility
- **Multiple Providers**: Easy to swap from LibreTranslate to Google/DeepL

### 🎯 User Experience
1. **Visual Hint**: First-time users see a subtle "Swipe to translate" chip
2. **Gesture Detection**: Robust swipe detection with configurable threshold
3. **Visual Feedback**: Real-time animation feedback during swipe
4. **Translation Display**: Smooth slide-down animation reveals translation
5. **Manual Controls**: Translate button for accessibility and preference

## Architecture

### Backend (Go)
```
backend/
├── internal/
│   ├── models/
│   │   └── translation.go          # Translation request/response types
│   ├── services/
│   │   └── translation_service.go  # LibreTranslate integration
│   ├── handlers/
│   │   └── translation_handler.go  # API endpoints
│   └── config/
│       └── config.go               # LibreTranslate configuration
```

### Frontend (TypeScript/React)
```
frontend/
├── services/
│   └── translationService.ts      # API client with caching
├── hooks/
│   └── useTranslation.ts          # Translation state management
├── features/messaging/
│   ├── types.ts                   # Translation types
│   └── components/
│       └── SwipeTranslateMessageBubble.tsx  # Main component
└── app/protected/sessions/[sessionId]/components/
    └── SwipeTranslateSessionMessage.tsx     # Session-specific component
```

## API Endpoints

### Translation
- `POST /api/translate` - Translate text
- `GET /api/translate/languages` - Get supported languages
- `GET /api/translate/health` - Check service health
- `GET /api/translate/info` - Service information

### Example Request
```json
POST /api/translate
{
  "text": "Hello, how are you?",
  "source_lang": "en",
  "target_lang": "es"
}
```

### Example Response
```json
{
  "original_text": "Hello, how are you?",
  "translated_text": "Hola, ¿cómo estás?",
  "source_lang": "en",
  "target_lang": "es",
  "provider": "libretranslate"
}
```

## Setup Instructions

### 1. Backend Setup

#### LibreTranslate (Self-hosted)
```bash
# Run LibreTranslate with Docker
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# Or with API key support
docker run -ti --rm -p 5000:5000 \
  -e LT_API_KEYS=true \
  libretranslate/libretranslate
```

#### Environment Variables
```bash
# .env
LIBRETRANSLATE_URL=http://localhost:5000
LIBRETRANSLATE_API_KEY=your_api_key_here  # Optional
```

### 2. Frontend Usage

#### Basic Usage
```tsx
import { SwipeTranslateMessageBubble } from '@/features/messaging/components/SwipeTranslateMessageBubble';

<SwipeTranslateMessageBubble
  message={message}
  isOwnMessage={false}
  enableTranslation={true}
  sourceLang="en"
  targetLang="es"
/>
```

#### Session Chat Integration
```tsx
import { SwipeTranslateSessionMessage } from './SwipeTranslateSessionMessage';

<SwipeTranslateSessionMessage
  message={sessionMessage}
  isCurrentUser={false}
  showAvatar={true}
  formatTime={formatTime}
  enableTranslation={true}
/>
```

#### Using Translation Hooks
```tsx
import { useTranslation, useTranslationPreferences } from '@/hooks/useTranslation';

function MyComponent() {
  const { 
    translateMessage, 
    getMessageTranslation, 
    isTranslating 
  } = useTranslation();
  
  const { 
    sourceLanguage, 
    targetLanguage, 
    setSourceLanguage 
  } = useTranslationPreferences();
  
  // Manual translation
  const handleTranslate = () => {
    translateMessage(messageId, text, sourceLanguage, targetLanguage);
  };
}
```

## Configuration

### Translation Preferences
Users can configure:
- **Source Language**: Auto-detect or manual selection
- **Target Language**: User's preferred translation language
- **Auto-translate**: Enable/disable automatic translation

### Service Configuration
```typescript
// Translation service options
const translationOptions = {
  defaultSourceLang: 'en',
  defaultTargetLang: 'es',
  autoDetectSource: true,
  enableCaching: true
};
```

### Gesture Configuration
```typescript
// Swipe sensitivity settings
const swipeThreshold = 80; // pixels
const velocityThreshold = 0.5; // for quick swipes
```

## Technical Details

### Caching Strategy
- **In-memory cache** with 1-hour expiration
- **LRU eviction** (500 entries max)
- **Cache key format**: `textHash:sourceLang:targetLang`

### Animation Performance
- **Hardware acceleration** using transform properties
- **Spring physics** for natural feel
- **Optimized re-renders** using React.memo and useCallback

### Error Handling
- **Network errors**: Graceful fallback with error message
- **Service unavailable**: Cached language list fallback
- **Invalid languages**: Validation before API call
- **Rate limiting**: Built-in retry logic

### Accessibility
- **Keyboard navigation**: Tab to translation controls
- **Screen readers**: ARIA labels for all interactive elements
- **Reduced motion**: Respects `prefers-reduced-motion`
- **High contrast**: Compatible with high contrast mode

## Future Enhancements

### Planned Features
- [ ] **Language detection**: Automatic source language detection
- [ ] **Batch translation**: Translate multiple messages at once
- [ ] **Translation history**: Keep track of user's translation activity
- [ ] **Premium providers**: Google Translate, DeepL integration
- [ ] **Offline support**: Basic translation for common phrases

### Potential Improvements
- [ ] **Voice translation**: Text-to-speech for translations
- [ ] **Image translation**: OCR + translation for images
- [ ] **Real-time translation**: Live translation as user types
- [ ] **Translation confidence**: Show confidence scores
- [ ] **Custom dictionaries**: User-defined translations

## Troubleshooting

### Common Issues

#### Translation Service Not Working
```bash
# Check LibreTranslate status
curl http://localhost:5000/languages

# Restart container
docker restart <container-id>
```

#### Frontend Type Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Gesture Not Working
- Ensure `touch-action: pan-y` is set
- Check for conflicting event handlers
- Verify Framer Motion is properly installed

### Debug Mode
```typescript
// Enable translation service debug logging
TranslationService.enableDebugMode(true);

// Check cache statistics
console.log(TranslationService.getCacheStats());
```

## Performance Considerations

### Optimization Tips
1. **Lazy load** translation component only when needed
2. **Debounce** rapid swipe gestures
3. **Preload** common language pairs
4. **Compress** API payloads for large texts
5. **CDN** for static translation resources

### Monitoring
- Track translation API response times
- Monitor cache hit rates
- Log translation errors for debugging
- Measure user engagement with feature

## Security

### Data Protection
- **No persistent storage** of translated content
- **Encrypted transit** for all API calls
- **Rate limiting** to prevent abuse
- **Input validation** for all user text

### Privacy Considerations
- Translations processed on self-hosted service
- No data sent to third-party services by default
- User consent for premium provider integration
- Clear data retention policies

## Testing

### Unit Tests
```bash
# Run translation service tests
npm test translationService

# Run component tests
npm test SwipeTranslateMessageBubble
```

### Integration Tests
```bash
# Test full translation flow
npm run test:integration translation
```

### Performance Tests
```bash
# Test with large messages
npm run test:performance translation
```

This implementation provides a robust, user-friendly translation feature that enhances the language exchange experience while maintaining performance and accessibility standards.