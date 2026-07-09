export function Instructions() {
  return (
    <div className="instructions">
      <h2>How to Play</h2>

      <div className="instruction-section">
        <h3>The Twist</h3>
        <p>
          Unlike Wordle, you guess <strong>all 25 cells at once</strong> (the entire 5×5 grid),
          not one word at a time.
        </p>
      </div>

      <div className="instruction-section">
        <h3>The Grid</h3>
        <p>
          The grid contains <strong>10 hidden words</strong>: 5 across (rows) and 5 down (columns).
          Every cell is shared between one across word and one down word.
        </p>
      </div>

      <div className="instruction-section">
        <h3>Color Meanings</h3>
        <div className="color-example">
          <div className="color-box color-correct">A</div>
          <div>
            <strong>Green:</strong> Letter is correct for this exact position
          </div>
        </div>
        <div className="color-example">
          <div className="color-box color-present-row">B</div>
          <div>
            <strong>Yellow:</strong> Letter exists in the row word (but wrong position)
          </div>
        </div>
        <div className="color-example">
          <div className="color-box color-present-col">C</div>
          <div>
            <strong>Blue:</strong> Letter exists in the column word (but wrong position)
          </div>
        </div>
        <div className="color-example">
          <div className="color-box color-present-both">D</div>
          <div>
            <strong>Purple:</strong> Letter exists in both row and column words (but wrong position)
          </div>
        </div>
        <div className="color-example">
          <div className="color-box color-absent">E</div>
          <div>
            <strong>Grey:</strong> Letter doesn't exist in either the row or column word
          </div>
        </div>
      </div>

      <div className="instruction-section">
        <h3>Rules</h3>
        <ul>
          <li>Each row must be a valid 5-letter English word</li>
          <li>You have {10} guesses to solve the entire grid</li>
          <li>All 10 words are different (no repeats)</li>
        </ul>
      </div>
    </div>
  );
}
