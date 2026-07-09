import type { WordSquare } from './types';

interface PartialGrid {
  acrossWords: (string | null)[];  // 5 slots
  downWords: (string | null)[];    // 5 slots
  grid: (string | null)[][];       // 5x5 grid
  usedWords: Set<string>;          // Track all used words to ensure uniqueness
}

/**
 * Build a candidate index for efficient lookup.
 * Maps each position and prefix to valid word candidates.
 */
function buildCandidateIndex(wordList: string[]): Map<string, string[]> {
  const index = new Map<string, string[]>();

  for (const word of wordList) {
    // Index by length (all should be 5, but good to be explicit)
    if (word.length !== 5) continue;

    // Index by each possible prefix pattern
    for (let prefixLen = 0; prefixLen <= 5; prefixLen++) {
      const prefix = word.substring(0, prefixLen);
      const key = `prefix_${prefixLen}_${prefix}`;
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key)!.push(word);
    }
  }

  return index;
}

/**
 * Get candidate words that match a partial constraint.
 * @param constraints Array of 5 elements, each either a known letter or null
 * @param wordList Full word list
 * @param index Pre-built candidate index
 */
function getCandidates(
  constraints: (string | null)[],
  _wordList: string[],
  index: Map<string, string[]>
): string[] {
  // Build prefix from known constraints
  let prefixLen = 0;
  let prefix = '';

  for (let i = 0; i < constraints.length; i++) {
    if (constraints[i] !== null) {
      // Ensure all previous positions are also known (no gaps)
      if (i !== prefixLen) break;
      prefix += constraints[i];
      prefixLen++;
    } else {
      break;
    }
  }

  // Get candidates matching the prefix
  const key = `prefix_${prefixLen}_${prefix}`;
  const prefixCandidates = index.get(key) || [];

  // Further filter by any non-prefix constraints
  return prefixCandidates.filter(word => {
    for (let i = 0; i < 5; i++) {
      if (constraints[i] !== null && word[i] !== constraints[i]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Backtracking solver for word square generation.
 */
function backtrack(
  partial: PartialGrid,
  rowIndex: number,
  wordList: string[],
  index: Map<string, string[]>
): WordSquare | null {
  // Base case: all rows filled
  if (rowIndex === 5) {
    // Verify all down words are valid
    for (let col = 0; col < 5; col++) {
      const downWord = partial.downWords[col];
      if (!downWord || !wordList.includes(downWord)) {
        return null;
      }
    }

    return {
      acrossWords: partial.acrossWords as string[],
      downWords: partial.downWords as string[],
      grid: partial.grid as string[][],
    };
  }

  // Get constraints for this row from already-placed column words
  const rowConstraints: (string | null)[] = [];
  for (let col = 0; col < 5; col++) {
    rowConstraints.push(partial.grid[rowIndex][col]);
  }

  // Get candidate words for this row
  const candidates = getCandidates(rowConstraints, wordList, index);

  // Shuffle candidates for variety
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  // Try each candidate
  for (const candidate of shuffled) {
    // Skip if this word is already used
    if (partial.usedWords.has(candidate)) {
      continue;
    }

    // Place the candidate
    partial.acrossWords[rowIndex] = candidate;
    partial.usedWords.add(candidate);
    for (let col = 0; col < 5; col++) {
      partial.grid[rowIndex][col] = candidate[col];
    }

    // Update down words
    let valid = true;
    const oldDownWords = [...partial.downWords];

    for (let col = 0; col < 5; col++) {
      // Build current down word at this column
      let downWord = '';
      let complete = true;
      for (let row = 0; row <= rowIndex; row++) {
        const letter = partial.grid[row][col];
        if (letter === null) {
          complete = false;
          break;
        }
        downWord += letter;
      }

      if (complete && rowIndex === 4) {
        // Final row: down word must be valid and unique
        if (!wordList.includes(downWord) || partial.usedWords.has(downWord)) {
          valid = false;
          break;
        }
        partial.downWords[col] = downWord;
        partial.usedWords.add(downWord);
      } else if (downWord.length > 0) {
        // Partial down word: check if any valid words have this prefix
        const downConstraints: (string | null)[] = [];
        for (let row = 0; row < 5; row++) {
          downConstraints.push(partial.grid[row][col]);
        }
        const downCandidates = getCandidates(downConstraints, wordList, index);

        // Filter out already-used words from candidates
        const availableCandidates = downCandidates.filter(w => !partial.usedWords.has(w));

        if (availableCandidates.length === 0) {
          valid = false;
          break;
        }
      }
    }

    if (valid) {
      // Recurse to next row
      const result = backtrack(partial, rowIndex + 1, wordList, index);
      if (result) {
        return result;
      }
    }

    // Backtrack: undo this candidate
    partial.acrossWords[rowIndex] = null;
    partial.usedWords.delete(candidate);
    // Remove any down words that were marked complete
    for (let col = 0; col < 5; col++) {
      if (oldDownWords[col] !== partial.downWords[col] && partial.downWords[col]) {
        partial.usedWords.delete(partial.downWords[col]!);
      }
    }
    partial.downWords = oldDownWords;
    for (let col = 0; col < 5; col++) {
      partial.grid[rowIndex][col] = null;
    }
  }

  return null;
}

/**
 * Generate a valid 5x5 word square.
 * Uses backtracking with random restarts.
 */
export function generateWordSquare(
  wordList: string[],
  maxAttempts: number = 1000
): WordSquare | null {
  console.log(`Starting generation with ${wordList.length} words, max ${maxAttempts} attempts`);
  const index = buildCandidateIndex(wordList);
  console.log(`Built candidate index with ${index.size} entries`);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt % 100 === 0 && attempt > 0) {
      console.log(`  ... still trying (attempt ${attempt})...`);
    }
    const partial: PartialGrid = {
      acrossWords: [null, null, null, null, null],
      downWords: [null, null, null, null, null],
      grid: [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
      ],
      usedWords: new Set(),
    };

    const result = backtrack(partial, 0, wordList, index);
    if (result) {
      console.log(`Success on attempt ${attempt + 1}`);
      return result;
    }
  }

  console.log(`Failed after ${maxAttempts} attempts`);
  return null;
}
