import { GuessHistory as GuessHistoryType } from '../utils/gameState';
import { CellStatus } from '../utils/feedback';

interface GuessHistoryProps {
  guesses: GuessHistoryType[];
}

function getCellColor(status: CellStatus): string {
  switch (status) {
    case CellStatus.CORRECT:
      return '#538d4e'; // Green
    case CellStatus.PRESENT_ROW:
      return '#b59f3b'; // Yellow
    case CellStatus.PRESENT_COL:
      return '#3a6bb5'; // Blue
    case CellStatus.PRESENT_BOTH:
      return '#8b4f9e'; // Purple
    case CellStatus.ABSENT:
      return '#3a3a3c'; // Grey
    default:
      return '#818384'; // Unknown
  }
}

export function GuessHistory({ guesses }: GuessHistoryProps) {
  if (guesses.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '0px', maxHeight: '600px', overflowY: 'auto' }}>
      <h3 style={{ marginBottom: '10px', fontSize: '16px', position: 'sticky', top: 0, backgroundColor: '#121213', paddingBottom: '5px' }}>Previous Guesses:</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {[...guesses].reverse().map((guess, reverseIdx) => {
          const guessIdx = guesses.length - 1 - reverseIdx;
          return (
          <div key={guessIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '12px', marginBottom: '3px', color: '#888' }}>
              Guess #{guessIdx + 1}
            </div>
            {guess.feedback.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {row.map((status, colIdx) => (
                  <div
                    key={colIdx}
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: getCellColor(status),
                      border: '2px solid #3a3a3c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                    }}
                  >
                    {guess.grid[rowIdx][colIdx]}
                  </div>
                ))}
              </div>
            ))}
          </div>
          );
        })}
      </div>
    </div>
  );
}
