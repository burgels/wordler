import { CellStatus } from '../utils/feedback';

interface GridProps {
  grid: string[][];
  feedback?: CellStatus[][];
  onCellChange?: (row: number, col: number, value: string) => void;
  readOnly?: boolean;
}

function getCellClassName(status?: CellStatus): string {
  if (!status) return 'cell';

  switch (status) {
    case CellStatus.CORRECT:
      return 'cell cell-correct';
    case CellStatus.PRESENT_ROW:
      return 'cell cell-present-row';
    case CellStatus.PRESENT_COL:
      return 'cell cell-present-col';
    case CellStatus.PRESENT_BOTH:
      return 'cell cell-present-both';
    case CellStatus.ABSENT:
      return 'cell cell-absent';
    default:
      return 'cell';
  }
}

export function Grid({ grid, feedback, onCellChange, readOnly = false }: GridProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (readOnly) return;

    // Arrow key navigation
    if (e.key === 'ArrowRight' && col < 4) {
      const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && col > 0) {
      const prevInput = document.querySelector(`input[data-row="${row}"][data-col="${col - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowDown' && row < 4) {
      const nextInput = document.querySelector(`input[data-row="${row + 1}"][data-col="${col}"]`) as HTMLInputElement;
      nextInput?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowUp' && row > 0) {
      const prevInput = document.querySelector(`input[data-row="${row - 1}"][data-col="${col}"]`) as HTMLInputElement;
      prevInput?.focus();
      e.preventDefault();
    } else if (e.key === 'Backspace' && !grid[row][col] && col > 0) {
      // If cell is empty and backspace is pressed, go to previous cell
      const prevInput = document.querySelector(`input[data-row="${row}"][data-col="${col - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    if (readOnly || !onCellChange) return;

    const value = e.target.value.toUpperCase();

    // Only allow single letters
    if (value.length > 1) {
      onCellChange(row, col, value[value.length - 1]);
    } else if (/^[A-Z]?$/.test(value)) {
      onCellChange(row, col, value);

      // Auto-advance to next cell
      if (value && col < 4) {
        const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      } else if (value && col === 4 && row < 4) {
        // Move to next row
        const nextInput = document.querySelector(`input[data-row="${row + 1}"][data-col="0"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="grid">
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} className="grid-row">
          {row.map((cell, colIdx) => {
            const cellStatus = feedback?.[rowIdx]?.[colIdx];
            const className = getCellClassName(cellStatus);
            const isLocked = cellStatus === CellStatus.CORRECT;

            return (
              <input
                key={colIdx}
                type="text"
                className={className}
                value={cell}
                onChange={(e) => handleChange(e, rowIdx, colIdx)}
                onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                maxLength={1}
                readOnly={readOnly || isLocked}
                data-row={rowIdx}
                data-col={colIdx}
                disabled={readOnly || isLocked}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
