export default function StartScreen({ onPlay }) {
  return (
    <div className="screen start-screen">
      <h1 className="title">Moments</h1>
      <p className="subtitle">
        A picture, they say, is worth a thousand words.
      </p>

      <hr className="section-divider" />

      <div className="how-it-works">
        <h2>How It Works</h2>
        <p>
          Upload a photo. AI running entirely in your browser picks a hidden
          word (3–7 letters) from the image. Your photo never leaves your
          computer.
        </p>
      </div>

      <hr className="section-divider" />

      <div className="how-to-play">
        <h2>How To Play</h2>
        <div className="examples">
          <div className="example-row">
            <div className="mini-tile correct">W</div>
            <div className="mini-tile">E</div>
            <div className="mini-tile">A</div>
            <div className="mini-tile">R</div>
            <div className="mini-tile">Y</div>
          </div>
          <p>
            <strong>W</strong> is in the word and in the correct spot.
          </p>

          <div className="example-row">
            <div className="mini-tile">P</div>
            <div className="mini-tile present">I</div>
            <div className="mini-tile">L</div>
            <div className="mini-tile">L</div>
            <div className="mini-tile">S</div>
          </div>
          <p>
            <strong>I</strong> is in the word but in the wrong spot.
          </p>

          <div className="example-row">
            <div className="mini-tile">V</div>
            <div className="mini-tile">A</div>
            <div className="mini-tile">G</div>
            <div className="mini-tile absent">U</div>
            <div className="mini-tile">E</div>
          </div>
          <p>
            <strong>U</strong> is not in the word in any spot.
          </p>
        </div>
      </div>

      <button type="button" className="play-button" onClick={onPlay}>
        Play
      </button>
    </div>
  );
}
