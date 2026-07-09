import { useState, useEffect } from 'react';
import { Grid } from './Grid';
import { GuessHistory } from './GuessHistory';
import { Instructions } from './Instructions';
import { getRandomPuzzle } from '../utils/puzzleLoader';
import { loadWordList } from '../utils/wordList';
import { initializeGame, submitGuess, updateCell, GameState } from '../utils/gameState';

export function Game() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [wordList, setWordList] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRandomPuzzle(), loadWordList()])
      .then(([puzzle, words]) => {
        setGameState(initializeGame(puzzle));
        setWordList(words);
        setLoading(false);
      })
      .catch(err => {
        setError(`Failed to load game: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const handleCellChange = (row: number, col: number, value: string) => {
    if (!gameState || gameState.gameOver) return;
    setGameState(updateCell(gameState, row, col, value));
    setError('');
  };

  const handleSubmit = () => {
    if (!gameState || gameState.gameOver) return;

    try {
      const newState = submitGuess(gameState, gameState.currentGuess, wordList);
      setGameState(newState);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleNewGame = () => {
    setLoading(true);
    getRandomPuzzle()
      .then(puzzle => {
        setGameState(initializeGame(puzzle));
        setLoading(false);
        setError('');
      })
      .catch(err => {
        setError(`Failed to load new game: ${err.message}`);
        setLoading(false);
      });
  };

  if (loading) {
    return <div className="container">Loading game...</div>;
  }

  if (error && !gameState) {
    return <div className="container">Error: {error}</div>;
  }

  if (!gameState) {
    return <div className="container">No game loaded</div>;
  }

  const canSubmit = gameState.currentGuess.every(row => row.every(cell => cell.length === 1));

  return (
    <div className="container">
      <h1>Magic Squardle</h1>

      <div className="game-info">
        <div>Guess {gameState.guesses.length + 1} of {gameState.maxGuesses}</div>
      </div>

      <div className="game-layout">
        <Instructions />

        <div className="game-main">
          {gameState.gameOver ? (
            <div className="game-over">
              <h2>{gameState.won ? '🎉 You Won!' : '😔 Game Over'}</h2>
              <p>
                {gameState.won
                  ? `Solved in ${gameState.guesses.length} guess${gameState.guesses.length === 1 ? '' : 'es'}!`
                  : `Better luck next time!`
                }
              </p>

              <div className="solution">
                <h3>Solution:</h3>
                <Grid grid={gameState.puzzle.grid} readOnly />
                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                  <div><strong>Across:</strong> {gameState.puzzle.acrossWords.join(', ')}</div>
                  <div><strong>Down:</strong> {gameState.puzzle.downWords.join(', ')}</div>
                </div>
              </div>

              <button onClick={handleNewGame} className="button" style={{ marginTop: '20px' }}>
                New Game
              </button>
            </div>
          ) : (
            <>
              <div className="current-grid">
                <Grid
                  grid={gameState.currentGuess}
                  feedback={gameState.guesses.length > 0 ? gameState.guesses[gameState.guesses.length - 1].feedback : undefined}
                  onCellChange={handleCellChange}
                />
              </div>

              {error && <div className="error">{error}</div>}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="button"
                style={{ marginTop: '20px' }}
              >
                Submit Guess
              </button>
            </>
          )}
        </div>

        {!gameState.gameOver && gameState.guesses.length > 0 && (
          <div className="guess-history-panel">
            <GuessHistory guesses={gameState.guesses} />
          </div>
        )}
        {(gameState.gameOver || gameState.guesses.length === 0) && (
          <div>{/* Empty spacer for centering */}</div>
        )}
      </div>
    </div>
  );
}
