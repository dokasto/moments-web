"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import posthog from "posthog-js";
import StartScreen from "./components/StartScreen";
import LoadingScreen from "./components/LoadingScreen";
import Game from "./components/Game";
import WinScreen from "./components/WinScreen";
import LossScreen from "./components/LossScreen";

const pageWrap = { style: { width: "100%", minHeight: "100dvh" } };
const pageTransition = {
  ...pageWrap,
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

const MAX_PICTURES_PER_DAY = 2;
const SESSION_KEY = "phordle_session";

function getTodayKey() {
  return `phordle_plays_${new Date().toISOString().slice(0, 10)}`;
}

function getPicturesPlayedToday() {
  try {
    return parseInt(localStorage.getItem(getTodayKey()) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementPicturesPlayed() {
  try {
    const key = getTodayKey();
    const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, String(count));
  } catch {
    // localStorage unavailable
  }
}

function blobUrlToDataUrl(blobUrl) {
  return fetch(blobUrl)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        }),
    );
}

function saveSession({ imageData, caption, wordList, usedWords, answer }) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        date: new Date().toISOString().slice(0, 10),
        imageData,
        caption,
        wordList,
        usedWords,
        answer,
      }),
    );
  } catch {
    // quota exceeded or unavailable
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (s.date !== today) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function App() {
  const [screen, setScreen] = useState("start");
  const [answer, setAnswer] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [dark, setDark] = useState(false);
  const [wordList, setWordList] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [restored, setRestored] = useState(false);

  // Restore saved session on mount
  useState(() => {
    const saved = loadSession();
    if (saved && saved.wordList.length > 0) {
      const remaining = saved.wordList.filter(
        (w) => !saved.usedWords.includes(w),
      );
      if (remaining.length > 0) {
        setImageData(saved.imageData);
        setImageUrl(saved.imageData); // data URL works as img src
        setCaption(saved.caption);
        setWordList(saved.wordList);
        setUsedWords(saved.usedWords);
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setUsedWords([...saved.usedWords, next]);
        setAnswer(next);
        setScreen("game");
        setRestored(true);
      }
    }
  });

  const persistSession = (updates) => {
    const s = {
      imageData: updates.imageData ?? imageData,
      caption: updates.caption ?? caption,
      wordList: updates.wordList ?? wordList,
      usedWords: updates.usedWords ?? usedWords,
      answer: updates.answer ?? answer,
    };
    saveSession(s);
  };

  const handlePlay = () => {
    if (getPicturesPlayedToday() >= MAX_PICTURES_PER_DAY) {
      posthog.capture("daily_limit_reached", {
        limit: MAX_PICTURES_PER_DAY,
      });
      setScreen("limit");
      return;
    }
    setScreen("loading");
  };

  const handleReady = useCallback((word, captionText, blobUrl, allWords) => {
    setAnswer(word);
    setCaption(captionText);
    setImageUrl(blobUrl);
    setWordList(allWords || []);
    setUsedWords([word]);
    setScreen("game");
    incrementPicturesPlayed();

    // Save image as data URL for persistence
    blobUrlToDataUrl(blobUrl).then((dataUrl) => {
      setImageData(dataUrl);
      saveSession({
        imageData: dataUrl,
        caption: captionText,
        wordList: allWords || [],
        usedWords: [word],
        answer: word,
      });
    });
  }, []);

  const handleWin = useCallback((finalGuesses) => {
    posthog.capture("game_won", {
      attempts: finalGuesses.length,
      word_length: answer.length,
    });
    setGuesses(finalGuesses);
    setScreen("win");
  }, [answer]);

  const handleLose = useCallback((finalGuesses) => {
    posthog.capture("game_lost", {
      attempts: finalGuesses.length,
      word_length: answer.length,
    });
    setGuesses(finalGuesses);
    setScreen("loss");
  }, [answer]);

  const remainingWords = wordList.filter((w) => !usedWords.includes(w));
  const hasMoreWords = remainingWords.length > 0;

  const handlePlayAgain = () => {
    if (!hasMoreWords) return;
    posthog.capture("play_again_clicked", {
      words_remaining: remainingWords.length,
    });
    const next =
      remainingWords[Math.floor(Math.random() * remainingWords.length)];
    const newUsed = [...usedWords, next];
    setUsedWords(newUsed);
    setAnswer(next);
    setGuesses([]);
    setScreen("game");
    persistSession({ usedWords: newUsed, answer: next });
  };

  const handleNewPicture = () => {
    posthog.capture("new_picture_clicked");
    if (imageUrl && imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    setAnswer("");
    setCaption("");
    setImageUrl(null);
    setImageData(null);
    setGuesses([]);
    setWordList([]);
    setUsedWords([]);
    clearSession();

    if (getPicturesPlayedToday() >= MAX_PICTURES_PER_DAY) {
      setScreen("limit");
    } else {
      setScreen("loading");
    }
  };

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <div className="top-banner">
        Best experienced on a desktop browser (Chrome recommended)
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setDark((d) => !d)}
        aria-label="Toggle theme"
      >
        {dark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
      </button>

      <AnimatePresence mode="wait">
        {screen === "start" && (
          <motion.div key="start" {...pageTransition}>
            <StartScreen onPlay={handlePlay} />
          </motion.div>
        )}
        {screen === "loading" && (
          <motion.div key="loading" {...pageTransition}>
            <LoadingScreen onReady={handleReady} />
          </motion.div>
        )}
        {screen === "game" && (
          <div key="game" style={{ width: "100%", minHeight: "100dvh" }}>
            <Game
              answer={answer}
              caption={caption}
              imageUrl={imageUrl}
              onWin={handleWin}
              onLose={handleLose}
            />
          </div>
        )}
        {screen === "win" && (
          <motion.div key="win" {...pageTransition}>
            <WinScreen
              guesses={guesses}
              answer={answer}
              imageUrl={imageUrl}
              hasMoreWords={hasMoreWords}
              onPlayAgain={handlePlayAgain}
              onNewPicture={handleNewPicture}
            />
          </motion.div>
        )}
        {screen === "loss" && (
          <motion.div key="loss" {...pageTransition}>
            <LossScreen
              guesses={guesses}
              answer={answer}
              imageUrl={imageUrl}
              hasMoreWords={hasMoreWords}
              onPlayAgain={handlePlayAgain}
              onNewPicture={handleNewPicture}
            />
          </motion.div>
        )}
        {screen === "limit" && (
          <motion.div key="limit" {...pageTransition}>
            <div className="screen end-screen">
              <h1 className="end-title">Come Back Tomorrow!</h1>
              <p className="end-message">
                You've played {MAX_PICTURES_PER_DAY} pictures today. See you
                tomorrow for more!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="app-footer">
        Built with {"\u2764\uFE0F"} by{" "}
        <a href="https://dokasto.com" target="_blank" rel="noopener noreferrer">
          Udo
        </a>
      </footer>
    </div>
  );
}

export default App;
