import type { WordSquare } from './types';

let cachedPuzzles: WordSquare[] | null = null;

export async function loadPuzzles(): Promise<WordSquare[]> {
  if (cachedPuzzles) {
    return cachedPuzzles;
  }

  const response = await fetch('/puzzles.json');
  cachedPuzzles = await response.json();
  return cachedPuzzles!;
}

export async function getRandomPuzzle(): Promise<WordSquare> {
  const puzzles = await loadPuzzles();
  const randomIndex = Math.floor(Math.random() * puzzles.length);
  return puzzles[randomIndex];
}
