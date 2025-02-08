import fetch from 'node-fetch';
import settings from '../../settings.js';
import keys from '../../keys.json' assert { type: 'json' };

// Read API key from keys.json
const GOOGLE_TRANSLATE_API_KEY = keys.GOOGLE_TRANSLATE_API_KEY;

/**
 * Detects the language of a message and translates it to English if it's not already in English
 * @param {string} message - The message to translate
 * @returns {Promise<{originalMessage: string, translatedMessage: string, detectedLanguage: string}>} - The translation result
 */
export async function handleTranslation(message) {
    try {
        console.log('🈁 Before translation:', message);
        
        if (!GOOGLE_TRANSLATE_API_KEY) {
            console.warn('Google Translate API key not found');
            return {
                originalMessage: message,
                translatedMessage: message,
                detectedLanguage: 'unknown'
            };
        }

        // First detect the language
        const detectUrl = `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`;
        const detectResponse = await fetch(detectUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: message
            })
        });

        const detectData = await detectResponse.json();
        const detectedLanguage = detectData.data?.detections?.[0]?.[0]?.language || 'unknown';
        console.log('🔍 Detected language:', detectedLanguage);

        // If already English or detection failed, return original
        if (detectedLanguage === 'en' || detectedLanguage === 'unknown') {
            console.log('🔤 No translation needed (English or unknown):', message);
            return {
                originalMessage: message,
                translatedMessage: message,
                detectedLanguage: detectedLanguage
            };
        }

        // Translate to English
        const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
        const translateResponse = await fetch(translateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: message,
                source: detectedLanguage,
                target: 'en',
                format: 'text'
            })
        });

        const translateData = await translateResponse.json();
        const translatedText = translateData.data?.translations?.[0]?.translatedText || message;
        console.log('🔤 After translation:', translatedText);

        return {
            originalMessage: message,
            translatedMessage: translatedText,
            detectedLanguage: detectedLanguage
        };
    } catch (error) {
        console.error('Translation error:', error);
        return {
            originalMessage: message,
            translatedMessage: message,
            detectedLanguage: 'unknown'
        };
    }
}

/**
 * Translates a message to English
 * @param {string} message - The message to translate
 * @returns {Promise<string>} - The translated message
 */
export async function handleEnglishTranslation(message) {
    const result = await handleTranslation(message);
    return result.translatedMessage;
}
