let cachedWordList: string[] | null = null;

export async function loadWordList(): Promise<string[]> {
  if (cachedWordList) {
    return cachedWordList;
  }

  const response = await fetch('/words.json');
  const words: string[] = await response.json();

  // Normalize to uppercase for consistency
  cachedWordList = words.map(w => w.toUpperCase());
  return cachedWordList;
}

export function isValidWord(word: string, wordList: string[]): boolean {
  return wordList.includes(word.toUpperCase());
}
