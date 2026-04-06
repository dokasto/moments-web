
export default function LossScreen({ answer, guesses, imageUrl, hasMoreWords, onPlayAgain, onNewPicture }) {
  return (
    <div className="screen end-screen loss-screen">
      {imageUrl && (
        <div className="end-image">
          <img src={imageUrl} alt="Your picture" />
        </div>
      )}
      <h1 className="end-title">Game Over</h1>
      <p className="end-message">The word was</p>
      <p className="end-word">{answer}</p>

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
