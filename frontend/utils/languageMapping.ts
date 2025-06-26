// Map language names to language codes
export const languageNameToCode: Record<string, string> = {
  'English': 'en',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Russian': 'ru',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Chinese': 'zh',
  'Chinese (Simplified)': 'zh',
  'Chinese (Traditional)': 'zh-TW',
  'Arabic': 'ar',
  'Hindi': 'hi',
  'Dutch': 'nl',
  'Swedish': 'sv',
  'Danish': 'da',
  'Norwegian': 'no',
  'Finnish': 'fi',
  'Polish': 'pl',
  'Turkish': 'tr',
  'Hebrew': 'he',
  'Thai': 'th',
  'Vietnamese': 'vi',
  'Indonesian': 'id',
  'Malay': 'ms',
  'Czech': 'cs',
  'Slovak': 'sk',
  'Hungarian': 'hu',
  'Romanian': 'ro',
  'Bulgarian': 'bg',
  'Greek': 'el',
  'Ukrainian': 'uk',
  'Serbian': 'sr',
  'Croatian': 'hr',
  'Slovenian': 'sl',
  'Lithuanian': 'lt',
  'Latvian': 'lv',
  'Estonian': 'et',
  'Persian': 'fa',
  'Urdu': 'ur',
  'Bengali': 'bn',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Marathi': 'mr',
  'Gujarati': 'gu',
  'Kannada': 'kn',
  'Malayalam': 'ml',
  'Punjabi': 'pa',
  'Nepali': 'ne',
  'Sinhala': 'si',
  'Burmese': 'my',
  'Khmer': 'km',
  'Lao': 'lo',
  'Georgian': 'ka',
  'Armenian': 'hy',
  'Azerbaijani': 'az',
  'Kazakh': 'kk',
  'Uzbek': 'uz',
  'Tajik': 'tg',
  'Kyrgyz': 'ky',
  'Turkmen': 'tk',
  'Mongolian': 'mn',
  'Tibetan': 'bo',
  'Albanian': 'sq',
  'Macedonian': 'mk',
  'Maltese': 'mt',
  'Icelandic': 'is',
  'Irish': 'ga',
  'Welsh': 'cy',
  'Basque': 'eu',
  'Catalan': 'ca',
  'Galician': 'gl',
  'Afrikaans': 'af',
  'Swahili': 'sw',
  'Zulu': 'zu',
  'Xhosa': 'xh',
  'Yoruba': 'yo',
  'Igbo': 'ig',
  'Hausa': 'ha',
  'Amharic': 'am',
  'Somali': 'so',
  'Maori': 'mi',
  'Hawaiian': 'haw',
  'Samoan': 'sm',
  'Tongan': 'to',
  'Fijian': 'fj',
  'Tagalog': 'tl',
  'Filipino': 'fil',
  'Esperanto': 'eo',
  'Latin': 'la',
};

// Map language codes to language names (reverse mapping)
export const languageCodeToName: Record<string, string> = Object.entries(languageNameToCode).reduce(
  (acc, [name, code]) => ({ ...acc, [code]: name }),
  {}
);

/**
 * Convert language name to language code
 * @param languageName - The language name (e.g., "English", "Spanish")
 * @returns The language code (e.g., "en", "es") or the original value if not found
 */
export function getLanguageCode(languageName: string): string {
  // First check if it's already a code
  if (languageName.length === 2 || languageName.length === 5) {
    return languageName.toLowerCase();
  }
  
  // Try to find the language code
  return languageNameToCode[languageName] || languageName.toLowerCase();
}

/**
 * Convert language code to language name
 * @param languageCode - The language code (e.g., "en", "es")
 * @returns The language name (e.g., "English", "Spanish") or the original value if not found
 */
export function getLanguageName(languageCode: string): string {
  return languageCodeToName[languageCode.toLowerCase()] || languageCode;
}