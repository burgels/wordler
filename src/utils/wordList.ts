let cachedWordList: string[] | null = null;

/**
 * Load the full word list for validation (allows more words than just puzzle words)
 */
export async function loadWordList(): Promise<string[]> {
  if (cachedWordList) {
    return cachedWordList;
  }

  const response = await fetch('/words-full.json');
  const words: string[] = await response.json();

  // Normalize to uppercase for consistency
  cachedWordList = words.map(w => w.toUpperCase());
  return cachedWordList;
}

export function isValidWord(word: string, wordList: string[]): boolean {
  return wordList.includes(word.toUpperCase());
}
