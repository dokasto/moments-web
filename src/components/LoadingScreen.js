import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import modelConfig from "../modelConfig";
import { loadCaptionModel, generateCaption } from "../captionGenerator";
import { generateWord } from "../wordGenerator";
import FUN_MESSAGES from "../constants/funMessages";
import PRIVACY_MESSAGES from "../constants/privacyMessages";

const STAGES = {
  UPLOAD: "upload",
  DOWNLOADING: "downloading",
  CAPTIONING: "captioning",
  GENERATING: "generating",
  READY: "ready",
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useRotatingMessage(messages, active, intervalMs = 2500) {
  const queue = useRef(shuffleArray(messages));
  const pos = useRef(0);
  const [message, setMessage] = useState(() => queue.current[0]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      pos.current++;
      if (pos.current >= queue.current.length) {
        queue.current = shuffleArray(messages);
        pos.current = 0;
      }
      setMessage(queue.current[pos.current]);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);

  return message;
}

export default function LoadingScreen({ onReady }) {
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelReady, setModelReady] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const imageReady = useRef(null);
  const ready = useRef(false);

  const isInference =
    stage === STAGES.CAPTIONING || stage === STAGES.GENERATING;
  const funMessage = useRotatingMessage(FUN_MESSAGES, isInference);
  const privacyMessage = useRotatingMessage(
    PRIVACY_MESSAGES,
    !modelReady,
    3000,
  );

  // Load Florence-2 caption model in web worker
  useEffect(() => {
    let fileCount = 0;
    let fileProgress = {};

    loadCaptionModel(modelConfig, (p) => {
      if (p.status === "initiate") fileCount++;
      if (p.status === "progress" && p.file) {
        fileProgress[p.file] = p.progress || 0;
        const values = Object.values(fileProgress);
        const avg =
          values.reduce((a, b) => a + b, 0) /
          Math.max(fileCount, values.length);
        setModelProgress(Math.round(avg));
      }
      if (p.status === "done" && p.file) {
        fileProgress[p.file] = 100;
      }
    })
      .then(() => {
        setModelProgress(100);
        setModelReady(true);
        ready.current = true;
        if (imageReady.current) {
          runPipeline(imageReady.current);
        }
      })
      .catch((err) => {
        setError("Failed to load AI model. Please refresh and try again.");
        console.error(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runPipeline = async (blobUrl) => {
    setStage(STAGES.CAPTIONING);
    try {
      const text = await generateCaption(blobUrl);

      if (process.env.NODE_ENV === "development") {
        console.log("[Phordle] Caption:", text);
      }

      setStage(STAGES.GENERATING);
      const { word, fromAI, allWords } = await generateWord(text, blobUrl);

      if (process.env.NODE_ENV === "development") {
        console.log("[Phordle] Word:", word, fromAI ? "(AI)" : "(fallback)");
        console.log("[Phordle] All words:", allWords);
      }

      setStage(STAGES.READY);
      setTimeout(() => onReady(word, text, blobUrl, allWords), 1200);
    } catch (err) {
      setError("Failed to analyze image. Please try another picture.");
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");

    if (process.env.NODE_ENV === "development") {
      const ext = file.name.split(".").pop()?.toLowerCase() || "unknown";
      console.log(
        `[Phordle] Image uploaded: "${file.name}" (${file.type || ext})`,
      );
    }

    const blobUrl = URL.createObjectURL(file);
    setImageUrl(blobUrl);
    imageReady.current = blobUrl;

    if (ready.current) {
      runPipeline(blobUrl);
    } else {
      setStage(STAGES.DOWNLOADING);
    }
  };

  return (
    <div className="screen loading-screen">
      <h1 className="title">Moments</h1>

      {imageUrl && (
        <motion.div
          className="image-preview"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: isInference
              ? [
                  "0 0 0px 0px rgba(201,180,88,0)",
                  "0 0 20px 6px rgba(201,180,88,0.6)",
                  "0 0 0px 0px rgba(201,180,88,0)",
                ]
              : "0 0 0px 0px rgba(201,180,88,0)",
          }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.4, type: "spring", stiffness: 200 },
            boxShadow: isInference
              ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 },
          }}
        >
          <img src={imageUrl} alt="Your upload" />
        </motion.div>
      )}

      {!imageUrl && (
        <motion.div
          className="upload-area"
          onClick={() => fileRef.current?.click()}
          whileHover={{ scale: 1.02, borderColor: "var(--correct)" }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="upload-icon">+</div>
          <p>Tap to upload your picture</p>
        </motion.div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <AnimatePresence mode="wait">
        {stage === STAGES.READY ? (
          <motion.p
            key="ready"
            className="loading-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Ready!
          </motion.p>
        ) : isInference ? (
          <motion.p
            key="inference"
            className="loading-status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {funMessage}
          </motion.p>
        ) : !modelReady ? (
          <motion.div
            key="downloading"
            className="progress-section"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <p className="loading-status">Downloading model</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${modelProgress}%` }}
              />
            </div>
            <p className="loading-status privacy-hint">{privacyMessage}</p>
          </motion.div>
        ) : stage === STAGES.UPLOAD && !imageUrl ? (
          <motion.p
            key="select"
            className="loading-status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            Select an image to begin
          </motion.p>
        ) : null}
      </AnimatePresence>

      {error && <p className="loading-error">{error}</p>}

      {imageUrl &&
        stage !== STAGES.CAPTIONING &&
        stage !== STAGES.GENERATING &&
        stage !== STAGES.READY && (
          <button
            type="button"
            className="change-image-btn"
            onClick={() => {
              setImageUrl(null);
              imageReady.current = null;
              fileRef.current.value = "";
              if (ready.current) setStage(STAGES.UPLOAD);
            }}
          >
            Change Picture
          </button>
        )}
    </div>
  );
}
