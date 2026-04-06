import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const MESSAGES = [
  'Genius', 'Magnificent', 'Impressive', 'Splendid', 'Great', 'Phew'
];

function fireConfetti() {
  const end = Date.now() + 2000;
  const colors = ['#6aaa64', '#c9b458', '#538d4e', '#b59f3b', '#ff6b6b', '#48dbfb', '#ff9ff3', '#feca57'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export default function WinScreen({ guesses, answer, imageUrl, hasMoreWords, onPlayAgain, onNewPicture }) {
  const attempts = guesses.length;
  const message = MESSAGES[Math.min(attempts - 1, MESSAGES.length - 1)];

  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <div className="screen end-screen win-screen">
      {imageUrl && (
        <div className="end-image">
          <img src={imageUrl} alt="Your picture" />
        </div>
      )}
      <h1 className="end-title">You Won!</h1>
      <p className="end-message">{message}</p>
      <p className="end-word">{answer}</p>
      <p className="end-attempts">{attempts}/6 attempts</p>

      <div className="share-grid">
        {guesses.map((guess, i) => (
          <div key={i} className="share-row">
            {guess.map((tile, j) => (
              <span key={j} className={`share-tile ${tile.status}`} />
            ))}
          </div>
        ))}
      </div>

      <div className="end-buttons">
        {hasMoreWords && (
          <button type="button" className="play-button" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
        <button type="button" className="play-button play-button--secondary" onClick={onNewPicture}>
          New Picture
        </button>
      </div>
    </div>
  );
}
