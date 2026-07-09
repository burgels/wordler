import type { WordSquare } from './types';
import { CellStatus, computeGridFeedback } from './feedback';

export interface GuessHistory {
  grid: string[][];           // The guessed 5x5 grid
  feedback: CellStatus[][];   // The feedback for this guess
}

export interface GameState {
  puzzle: WordSquare;
  guesses: GuessHistory[];
  currentGuess: string[][];      // The grid being typed (5x5 of strings, empty = '')
  bestKnownStatus: CellStatus[][]; // Best feedback achieved for each cell across all guesses
  maxGuesses: number;
  gameOver: boolean;
  won: boolean;
}

export const MAX_GUESSES = 10;
export const REQUIRE_VALID_WORDS = true; // Flag to enable/disable word validation

/**
 * Initialize a new game state with a puzzle.
 */
export function initializeGame(puzzle: WordSquare): GameState {
  return {
    puzzle,
    guesses: [],
    currentGuess: Array(5).fill(null).map(() => Array(5).fill('')),
    bestKnownStatus: Array(5).fill(null).map(() => Array(5).fill(CellStatus.ABSENT)),
    maxGuesses: MAX_GUESSES,
    gameOver: false,
    won: false,
  };
}

/**
 * Submit a guess and update game state.
 * Returns the updated game state.
 */
export function submitGuess(
  state: GameState,
  guessGrid: string[][],
  wordList?: string[]
): GameState {
  // Validate that all cells are filled
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (!guessGrid[row][col] || guessGrid[row][col].length !== 1) {
        throw new Error('All cells must be filled with a single letter');
      }
    }
  }

  // Optionally validate that all row words are valid English words
  if (REQUIRE_VALID_WORDS && wordList) {
    for (let row = 0; row < 5; row++) {
      const rowWord = guessGrid[row].join('').toUpperCase();
      if (!wordList.includes(rowWord)) {
        throw new Error(`"${rowWord}" is not a valid word (row ${row + 1})`);
      }
    }
  }

  // Normalize to uppercase
  const normalizedGuess = guessGrid.map(row => row.map(letter => letter.toUpperCase()));

  // Compute feedback
  const feedback = computeGridFeedback(normalizedGuess, state.puzzle.grid);

  // Update best-known status (green sticks, don't downgrade)
  const newBestKnownStatus = state.bestKnownStatus.map((row, r) =>
    row.map((status, c) => {
      const newStatus = feedback[r][c];
      // Green > Purple > Yellow/Blue > Grey in terms of "best" status
      if (status === CellStatus.CORRECT) return CellStatus.CORRECT;
      if (newStatus === CellStatus.CORRECT) return CellStatus.CORRECT;
      if (status === CellStatus.PRESENT_BOTH) return CellStatus.PRESENT_BOTH;
      if (newStatus === CellStatus.PRESENT_BOTH) return CellStatus.PRESENT_BOTH;
      if (status === CellStatus.PRESENT_ROW || status === CellStatus.PRESENT_COL) return status;
      return newStatus;
    })
  );

  // Add to guess history
  const newGuesses = [
    ...state.guesses,
    { grid: normalizedGuess, feedback }
  ];

  // Check win condition: all cells are correct
  const won = feedback.every(row => row.every(cell => cell === CellStatus.CORRECT));

  // Check game over condition
  const gameOver = won || newGuesses.length >= state.maxGuesses;

  // Pre-fill next guess with correct letters (green cells)
  const nextGuess = newBestKnownStatus.map((row, r) =>
    row.map((status, c) =>
      status === CellStatus.CORRECT ? state.puzzle.grid[r][c] : ''
    )
  );

  return {
    ...state,
    guesses: newGuesses,
    currentGuess: nextGuess,
    bestKnownStatus: newBestKnownStatus,
    gameOver,
    won,
  };
}

/**
 * Update a single cell in the current guess.
 */
export function updateCell(
  state: GameState,
  row: number,
  col: number,
  letter: string
): GameState {
  const newCurrentGuess = state.currentGuess.map((r, rowIdx) =>
    r.map((cell, colIdx) =>
      rowIdx === row && colIdx === col ? letter.toUpperCase() : cell
    )
  );

  return {
    ...state,
    currentGuess: newCurrentGuess,
  };
}

/**
 * Get the revealed grid showing best-known letters.
 * Green cells show the correct letter, others show empty.
 */
export function getRevealedGrid(state: GameState): string[][] {
  return state.bestKnownStatus.map((row, r) =>
    row.map((status, c) =>
      status === CellStatus.CORRECT ? state.puzzle.grid[r][c] : ''
    )
  );
}
