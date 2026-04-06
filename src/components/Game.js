import { useState, useEffect, useCallback } from "react";
import ImageViewer from "./ImageViewer";

const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

function evaluateGuess(guess, answer) {
  const wordLength = answer.length;
  const result = guess.split("").map((letter) => ({
    letter,
    status: "absent",
  }));

  const answerArr = answer.split("");
  const used = new Array(wordLength).fill(false);

  for (let i = 0; i < wordLength; i++) {
    if (result[i].letter === answerArr[i]) {
      result[i].status = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < wordLength; i++) {
    if (result[i].status === "correct") continue;
    for (let j = 0; j < wordLength; j++) {
      if (!used[j] && result[i].letter === answerArr[j]) {
        result[i].status = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

export default function Game({ answer, caption, imageUrl, onWin, onLose }) {
  const wordLength = answer.length;
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [shake, setShake] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  const usedKeys = {};
  guesses.forEach((guess) => {
    guess.forEach(({ letter, status }) => {
      const prev = usedKeys[letter];
      if (status === "correct") usedKeys[letter] = "correct";
      else if (status === "present" && prev !== "correct")
        usedKeys[letter] = "present";
      else if (!prev) usedKeys[letter] = "absent";
    });
  });

  const submitGuess = useCallback(() => {
    if (currentGuess.length !== wordLength) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const result = evaluateGuess(currentGuess, answer);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setCurrentGuess("");

    if (currentGuess === answer) {
      setTimeout(() => onWin(newGuesses), 1500);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setTimeout(() => onLose(newGuesses), 1500);
    }
  }, [currentGuess, answer, guesses, onWin, onLose, wordLength]);

  const handleKey = useCallback(
    (key) => {
      if (guesses.length >= MAX_GUESSES) return;
      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACK" || key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, guesses.length, submitGuess, wordLength],
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  const renderBoard = () => {
    const rows = [];
    for (let i = 0; i < MAX_GUESSES; i++) {
      const tiles = [];
      for (let j = 0; j < wordLength; j++) {
        let letter = "";
        let status = "empty";

        if (i < guesses.length) {
          letter = guesses[i][j].letter;
          status = guesses[i][j].status;
        } else if (i === guesses.length && j < currentGuess.length) {
          letter = currentGuess[j];
          status = "tbd";
        }

        const isRevealing = i === guesses.length - 1;
        tiles.push(
          <div
            key={j}
            className={`tile ${status} ${isRevealing && status !== "empty" && status !== "tbd" ? "reveal" : ""} ${letter ? "filled" : ""}`}
            style={
              isRevealing && status !== "empty" && status !== "tbd"
                ? { animationDelay: `${j * 300}ms` }
                : {}
            }
          >
            {letter}
          </div>,
        );
      }

      const isCurrentRow = i === guesses.length;
      rows.push(
        <div
          key={i}
          className={`board-row ${isCurrentRow && shake ? "shake" : ""}`}
        >
          {tiles}
        </div>,
      );
    }
    return rows;
  };

  return (
    <div className="game" style={{ "--word-length": wordLength }}>
      <header className="game-header">
        <h1>Moments</h1>
        {imageUrl && (
          <button
            type="button"
            className="view-photo-btn"
            onClick={() => setShowViewer(true)}
            aria-label="View photo"
          >
            View Photo
          </button>
        )}
      </header>
      {showViewer && imageUrl && (
        <ImageViewer src={imageUrl} onClose={() => setShowViewer(false)} />
      )}
      {/* Caption hidden from UI, logged in dev mode only */}
      <div className="board-container">
        <div className="board">{renderBoard()}</div>
      </div>
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} className="keyboard-row">
            {i === 1 && <div className="half-spacer" />}
            {row.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === "BACK" ? "Backspace" : key}
                className={`key ${usedKeys[key] || ""} ${key.length > 1 ? "wide" : ""}`}
                onClick={() => handleKey(key)}
              >
                {key === "BACK" ? "\u232B" : key}
              </button>
            ))}
            {i === 1 && <div className="half-spacer" />}
          </div>
        ))}
      </div>
    </div>
  );
}
