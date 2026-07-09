import { generateWordSquare } from './wordSquareGenerator';
import { loadWordList } from './wordList';

/**
 * Validate that a word square is correctly formed.
 */
function validateWordSquare(square: any, wordList: string[]): boolean {
  if (!square) {
    console.error('❌ Generator returned null');
    return false;
  }

  const { acrossWords, downWords, grid } = square;

  // Check dimensions
  if (acrossWords.length !== 5 || downWords.length !== 5) {
    console.error('❌ Wrong number of words');
    return false;
  }

  if (grid.length !== 5 || grid.some((row: any[]) => row.length !== 5)) {
    console.error('❌ Grid is not 5x5');
    return false;
  }

  // Verify all words are in the word list
  for (let i = 0; i < 5; i++) {
    if (!wordList.includes(acrossWords[i])) {
      console.error(`❌ Across word ${i} "${acrossWords[i]}" not in word list`);
      return false;
    }
    if (!wordList.includes(downWords[i])) {
      console.error(`❌ Down word ${i} "${downWords[i]}" not in word list`);
      return false;
    }
  }

  // Verify grid consistency with across words
  for (let row = 0; row < 5; row++) {
    const gridRow = grid[row].join('');
    if (gridRow !== acrossWords[row]) {
      console.error(`❌ Row ${row} mismatch: grid="${gridRow}" vs across="${acrossWords[row]}"`);
      return false;
    }
  }

  // Verify grid consistency with down words
  for (let col = 0; col < 5; col++) {
    const gridCol = grid.map((row: string[]) => row[col]).join('');
    if (gridCol !== downWords[col]) {
      console.error(`❌ Col ${col} mismatch: grid="${gridCol}" vs down="${downWords[col]}"`);
      return false;
    }
  }

  // Verify all words are unique
  const allWords = [...acrossWords, ...downWords];
  const uniqueWords = new Set(allWords);
  if (uniqueWords.size !== 10) {
    console.error(`❌ Not all words are unique: ${allWords.join(', ')}`);
    return false;
  }

  return true;
}

/**
 * Test the word square generator.
 */
export async function testWordSquareGenerator(): Promise<void> {
  console.log('🧪 Testing Word Square Generator...\n');

  const wordList = await loadWordList();
  console.log(`📚 Loaded ${wordList.length} words\n`);

  // Test multiple generations
  const numTests = 5;
  let successCount = 0;

  for (let i = 0; i < numTests; i++) {
    console.log(`\n--- Test ${i + 1}/${numTests} ---`);
    const startTime = performance.now();

    const square = generateWordSquare(wordList, 100);
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    if (validateWordSquare(square, wordList)) {
      successCount++;
      console.log(`✅ Valid word square generated in ${duration}ms`);
      console.log('\nGrid:');
      square!.grid.forEach((row, idx) => {
        console.log(`  ${row.join(' ')}  <- ${square!.acrossWords[idx]}`);
      });
      console.log('\nDown words:', square!.downWords.join(', '));
    } else {
      console.log(`❌ Generation failed or invalid (${duration}ms)`);
    }
  }

  console.log(`\n\n📊 Results: ${successCount}/${numTests} successful generations`);

  if (successCount === numTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed');
  }
}
