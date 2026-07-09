/**
 * Cell feedback status
 * - CORRECT (green): Letter is in the correct position
 * - PRESENT_ROW (yellow): Letter exists in the row word but wrong position
 * - PRESENT_COL (blue): Letter exists in the column word but wrong position
 * - PRESENT_BOTH (purple): Letter exists in both row and column words but wrong position
 * - ABSENT (grey): Letter does not exist in either word
 */
export enum CellStatus {
  CORRECT = 'correct',
  PRESENT_ROW = 'present-row',
  PRESENT_COL = 'present-col',
  PRESENT_BOTH = 'present-both',
  ABSENT = 'absent',
}

/**
 * Compute Wordle-style feedback for a single word guess.
 * Handles duplicate letters correctly according to Wordle rules:
 * - If answer has 1 'A' and guess has 2 'A's, only mark the best one (correct > present)
 * - Letter counts in the answer determine how many can be marked yellow/green
 *
 * @param guess - The guessed word (5 letters)
 * @param answer - The answer word (5 letters)
 * @returns Array of 5 CellStatus values
 */
/**
 * Internal status used by computeWordFeedback before merging
 */
enum WordFeedbackStatus {
  CORRECT = 'correct',
  PRESENT = 'present',
  ABSENT = 'absent',
}

export function computeWordFeedback(guess: string, answer: string): WordFeedbackStatus[] {
  const result: WordFeedbackStatus[] = Array(5).fill(WordFeedbackStatus.ABSENT);
  const answerLetters = answer.split('');
  const guessLetters = guess.split('');

  // First pass: Mark all correct (green) positions
  const remainingAnswerLetters: string[] = [];
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = WordFeedbackStatus.CORRECT;
    } else {
      remainingAnswerLetters.push(answerLetters[i]);
    }
  }

  // Second pass: Mark present positions from remaining letters
  for (let i = 0; i < 5; i++) {
    if (result[i] === WordFeedbackStatus.CORRECT) {
      continue; // Already marked correct
    }

    const guessLetter = guessLetters[i];
    const indexInRemaining = remainingAnswerLetters.indexOf(guessLetter);

    if (indexInRemaining !== -1) {
      result[i] = WordFeedbackStatus.PRESENT;
      // Remove this letter from remaining pool
      remainingAnswerLetters.splice(indexInRemaining, 1);
    }
  }

  return result;
}

/**
 * Merge feedback from row and column evaluations into final cell status.
 *
 * Rules:
 * - CORRECT (green) only appears when BOTH row and column agree (letter is correct for this cell)
 * - PRESENT_ROW (yellow) if letter is present in row word only
 * - PRESENT_COL (blue) if letter is present in column word only
 * - PRESENT_BOTH (purple) if letter is present in both row and column words
 * - ABSENT (grey) only appears when BOTH row and column say absent
 *
 * @param rowStatus - Feedback from evaluating the row word
 * @param colStatus - Feedback from evaluating the column word
 * @returns The merged cell status
 */
export function mergeCellFeedback(rowStatus: WordFeedbackStatus, colStatus: WordFeedbackStatus): CellStatus {
  // Green only when both agree the letter is correct
  if (rowStatus === WordFeedbackStatus.CORRECT && colStatus === WordFeedbackStatus.CORRECT) {
    return CellStatus.CORRECT;
  }

  // Determine if letter is present in row, column, or both
  const isPresentInRow = rowStatus === WordFeedbackStatus.PRESENT;
  const isPresentInCol = colStatus === WordFeedbackStatus.PRESENT;

  if (isPresentInRow && isPresentInCol) {
    return CellStatus.PRESENT_BOTH; // Purple - in both
  } else if (isPresentInRow) {
    return CellStatus.PRESENT_ROW; // Yellow - row only
  } else if (isPresentInCol) {
    return CellStatus.PRESENT_COL; // Blue - column only
  }

  // Grey when both say absent
  return CellStatus.ABSENT;
}

/**
 * Compute feedback for the entire 5x5 grid.
 *
 * @param guessGrid - 5x5 grid of guessed letters
 * @param answerGrid - 5x5 grid of answer letters (from WordSquare)
 * @returns 5x5 grid of CellStatus values
 */
export function computeGridFeedback(
  guessGrid: string[][],
  answerGrid: string[][]
): CellStatus[][] {
  const feedback: CellStatus[][] = [];

  for (let row = 0; row < 5; row++) {
    feedback[row] = [];
    for (let col = 0; col < 5; col++) {
      // Get the guessed and answer words for this cell's row and column
      const guessRow = guessGrid[row].join('');
      const answerRow = answerGrid[row].join('');

      const guessCol = guessGrid.map(r => r[col]).join('');
      const answerCol = answerGrid.map(r => r[col]).join('');

      // Compute feedback for each axis
      const rowFeedback = computeWordFeedback(guessRow, answerRow);
      const colFeedback = computeWordFeedback(guessCol, answerCol);

      // Merge the feedback for this specific cell
      feedback[row][col] = mergeCellFeedback(rowFeedback[col], colFeedback[row]);
    }
  }

  return feedback;
}
