import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load word list
const wordsPath = join(__dirname, '../public/words.json');
const wordList = JSON.parse(fs.readFileSync(wordsPath, 'utf-8')).map(w => w.toUpperCase());

console.log(`Loaded ${wordList.length} words`);

// Build candidate index
function buildCandidateIndex(wordList) {
  const index = new Map();

  for (const word of wordList) {
    if (word.length !== 5) continue;

    for (let prefixLen = 0; prefixLen <= 5; prefixLen++) {
      const prefix = word.substring(0, prefixLen);
      const key = `prefix_${prefixLen}_${prefix}`;
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key).push(word);
    }
  }

  return index;
}

function getCandidates(constraints, wordList, index) {
  let prefixLen = 0;
  let prefix = '';

  for (let i = 0; i < constraints.length; i++) {
    if (constraints[i] !== null) {
      if (i !== prefixLen) break;
      prefix += constraints[i];
      prefixLen++;
    } else {
      break;
    }
  }

  const key = `prefix_${prefixLen}_${prefix}`;
  const prefixCandidates = index.get(key) || [];

  return prefixCandidates.filter(word => {
    for (let i = 0; i < 5; i++) {
      if (constraints[i] !== null && word[i] !== constraints[i]) {
        return false;
      }
    }
    return true;
  });
}

function backtrack(partial, rowIndex, wordList, index) {
  if (rowIndex === 5) {
    for (let col = 0; col < 5; col++) {
      const downWord = partial.downWords[col];
      if (!downWord || !wordList.includes(downWord)) {
        return null;
      }
    }

    return {
      acrossWords: partial.acrossWords,
      downWords: partial.downWords,
      grid: partial.grid,
    };
  }

  const rowConstraints = [];
  for (let col = 0; col < 5; col++) {
    rowConstraints.push(partial.grid[rowIndex][col]);
  }

  const candidates = getCandidates(rowConstraints, wordList, index);
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);

  for (const candidate of shuffled) {
    if (partial.usedWords.has(candidate)) {
      continue;
    }

    partial.acrossWords[rowIndex] = candidate;
    partial.usedWords.add(candidate);
    for (let col = 0; col < 5; col++) {
      partial.grid[rowIndex][col] = candidate[col];
    }

    let valid = true;
    const oldDownWords = [...partial.downWords];

    for (let col = 0; col < 5; col++) {
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
        if (!wordList.includes(downWord) || partial.usedWords.has(downWord)) {
          valid = false;
          break;
        }
        partial.downWords[col] = downWord;
        partial.usedWords.add(downWord);
      } else if (downWord.length > 0) {
        const downConstraints = [];
        for (let row = 0; row < 5; row++) {
          downConstraints.push(partial.grid[row][col]);
        }
        const downCandidates = getCandidates(downConstraints, wordList, index);
        const availableCandidates = downCandidates.filter(w => !partial.usedWords.has(w));

        if (availableCandidates.length === 0) {
          valid = false;
          break;
        }
      }
    }

    if (valid) {
      const result = backtrack(partial, rowIndex + 1, wordList, index);
      if (result) {
        return result;
      }
    }

    partial.acrossWords[rowIndex] = null;
    partial.usedWords.delete(candidate);
    for (let col = 0; col < 5; col++) {
      if (oldDownWords[col] !== partial.downWords[col] && partial.downWords[col]) {
        partial.usedWords.delete(partial.downWords[col]);
      }
    }
    partial.downWords = oldDownWords;
    for (let col = 0; col < 5; col++) {
      partial.grid[rowIndex][col] = null;
    }
  }

  return null;
}

function generateWordSquare(wordList, index, maxAttempts = 1000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const partial = {
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
      return result;
    }
  }

  return null;
}

// Generate multiple puzzles
const targetCount = 50; // Start with just 5 to test
const puzzles = [];
const index = buildCandidateIndex(wordList);

console.log(`Attempting to generate ${targetCount} puzzles...`);
console.log(`(This may take a while - each puzzle requires finding 10 unique intersecting words)\n`);

for (let i = 0; i < targetCount; i++) {
  const startTime = Date.now();
  process.stdout.write(`Generating puzzle ${i + 1}/${targetCount}...`);

  const puzzle = generateWordSquare(wordList, index, 5000);

  if (puzzle) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(` ✓ (${elapsed}s)`);
    puzzles.push(puzzle);
  } else {
    console.log(` ✗ (gave up after 5000 attempts)`);
    // Don't break, keep trying
  }

  // Save progress periodically
  if (puzzles.length > 0 && (i + 1) % 10 === 0) {
    const outputPath = join(__dirname, '../public/puzzles.json');
    fs.writeFileSync(outputPath, JSON.stringify(puzzles, null, 2));
    console.log(`  → Saved ${puzzles.length} puzzles so far...`);
  }
}

console.log(`\n\n✅ Successfully generated ${puzzles.length} puzzles`);

// Save to file
const outputPath = join(__dirname, '../public/puzzles.json');
fs.writeFileSync(outputPath, JSON.stringify(puzzles, null, 2));

console.log(`📁 Saved to ${outputPath}`);

// Show a sample
if (puzzles.length > 0) {
  console.log('\nSample puzzle:');
  console.log('Across:', puzzles[0].acrossWords.join(', '));
  console.log('Down:', puzzles[0].downWords.join(', '));
  console.log('\nGrid:');
  puzzles[0].grid.forEach(row => console.log('  ' + row.join(' ')));
}
