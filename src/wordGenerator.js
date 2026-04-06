/**
 * Word generation via algorithmic extraction from a caption.
 * Extracts content words (nouns/adjectives) by filtering out stop words,
 * then randomly picks one for the game.
 */
import STOP_WORDS from './constants/stopWords';

const isDev = process.env.NODE_ENV === 'development';

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 7;

/**
 * Extract content words (nouns/adjectives) from caption text.
 * Splits on whitespace, removes non-alpha chars, filters stop words.
 */
function extractContentWords(caption) {
  const words = caption
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, '').toUpperCase())
    .filter((w) => w.length >= MIN_WORD_LENGTH && w.length <= MAX_WORD_LENGTH)
    .filter((w) => !STOP_WORDS.has(w));
  return [...new Set(words)];
}

/**
 * Generate a word (3-7 letters) from a caption by extracting content words
 * and randomly selecting one.
 *
 * @param {string} caption - The image caption text
 * @param {string} imageSource - The blob URL (unused, kept for API compat)
 * @returns {Promise<{ word: string, fromAI: boolean, allWords: string[] }>}
 */
export async function generateWord(caption, imageSource) {
  if (isDev) {
    console.group('[WordGen] Generate word');
    console.log(`Caption: "${caption}"`);
  }

  const words = extractContentWords(caption);

  if (isDev) console.log(`Candidates: [${words.join(', ')}]`);

  if (words.length > 0) {
    const word = words[Math.floor(Math.random() * words.length)];
    if (isDev) {
      console.log(`Selected: "${word}"`);
      console.groupEnd();
    }
    return { word, fromAI: true, allWords: words };
  }

  if (isDev) {
    console.log('No valid words found. Fallback.');
    console.groupEnd();
  }
  return { word: 'IMAGE', fromAI: false, allWords: [] };
}

// No-op — no separate word model needed
export function loadWordModel() {
  return Promise.resolve();
}
