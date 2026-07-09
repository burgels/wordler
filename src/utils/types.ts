export interface WordSquare {
  acrossWords: string[]; // 5 words, one per row
  downWords: string[];   // 5 words, one per column
  grid: string[][];      // 5x5 grid of letters
}
