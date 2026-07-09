# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Double Word Square: a 5x5 grid puzzle game (Wordle variant) where players guess all 25 cells simultaneously. The grid contains 10 hidden words (5 across, 5 down) that share letters at intersections. Each turn submits the entire grid and receives feedback on all 25 cells.

**Tech Stack:** TypeScript, React (functional components only), Vite

## Development Commands

```bash
npm install           # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests (once configured)
```

## Core Architecture

### Game Mechanics (Key Differences from Standard Wordle)

- **Full-grid guessing:** Player fills all 25 cells per turn, not one word at a time
- **Dual-axis feedback:** Each cell evaluated against both its row-word AND column-word
- **Merged feedback logic:**
  - GREEN: Letter is correct for this cell (matches both row and column answer)
  - YELLOW: Letter exists elsewhere in EITHER the row answer OR column answer (ambiguity is intentional)
  - GREY: Letter doesn't exist in either axis
- **Best-known status:** Green cells persist across guesses; once green, that letter is locked and should remain visible
- **Validation:** All 5 row-guesses must be valid English words (configurable flag to disable)
- **Win condition:** All 25 cells green within max guesses (default: 10)

### Critical Components

#### 1. Puzzle Generator (`backtracking word square generator`)
Backtracking algorithm to create valid 5x5 double word squares:
- Load 5-letter word list (static JSON/text asset)
- Recursively place words checking intersection constraints
- Retry with different starting words if backtracking fails
- Must run near-instantly client-side

#### 2. Feedback Merge Function (`mergeCellFeedback(rowStatus, colStatus)`)
**Most critical logic to get right:**
- Computes row-based feedback using standard Wordle rules (including duplicate letter handling)
- Computes column-based feedback independently
- Merges: Green overrides all; Yellow (from either axis) overrides Grey
- Must be isolated, well-named, and thoroughly unit tested
- Test edge cases: row/column disagreement, duplicate letters

#### 3. Game State Management
- Track full-grid guess history (not per-word)
- Persist best-known-status per cell across guesses
- Single shared guess counter for entire puzzle
- No Redux needed; use useState/useReducer

### Build Order (Pause for Feedback After Each Phase)

1. **Word list + generator:** Backtracking algorithm with test/console validation
2. **Core game logic:** Grid model, submission, dual-axis feedback, merge function + unit tests
3. **Status persistence:** Green cells stick, no downgrading
4. **React UI:** Grid input, submission, color coding, guess history
5. **Win/loss + polish**

## Key Implementation Notes

- **No class components:** Use functional components + hooks only
- **Duplicate letter handling:** Follow standard Wordle rules (if answer has 1 'A' and guess has 2 'A's, only mark 1)
- **Column guesses:** Read vertically from row input; not separately entered
- **Yellow ambiguity:** Never reveal which axis (row/column) produced the yellow
- **Hardest parts:** (a) Backtracking generator, (b) Merge function correctness - prioritize these before UI polish
