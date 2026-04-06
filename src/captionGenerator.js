/**
 * Image captioning using Florence-2 — runs in a web worker to avoid blocking the main thread.
 */
const isDev = process.env.NODE_ENV === "development";

let worker = null;
let idCounter = 0;
const pending = {};
let progressCb = null;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL("./workers/captionWorker.js", import.meta.url));
    worker.onmessage = (e) => {
      const { type, id, ...rest } = e.data;
      if (type === "progress") {
        if (progressCb) progressCb(rest);
        return;
      }
      const cb = pending[id];
      if (!cb) return;
      delete pending[id];
      if (type === "error") cb.reject(new Error(rest.error));
      else if (type === "loaded") cb.resolve();
      else if (type === "result") cb.resolve(rest.data);
    };
  }
  return worker;
}

function call(type, data) {
  const id = ++idCounter;
  return new Promise((resolve, reject) => {
    pending[id] = { resolve, reject };
    getWorker().postMessage({ type, id, ...data });
  });
}

/**
 * Load the Florence-2 model in the web worker.
 * @param {object} config - { model, dtype }
 * @param {function} onProgress
 */
export function loadCaptionModel(config, onProgress) {
  progressCb = onProgress;
  if (isDev) console.log(`[Florence-2] Loading: ${config.model}`);
  return call("load", config).then(() => {
    if (isDev) console.log("[Florence-2] Loaded successfully");
  });
}

/**
 * Generate a caption from an image (runs in worker, non-blocking).
 * @param {string} imageSource - blob URL or URL string
 * @returns {Promise<string>}
 */
export async function generateCaption(imageSource) {
  if (isDev) console.log("[Florence-2] Captioning...");
  const caption = await call("caption", { imageSource });
  if (isDev) console.log(`[Florence-2] Caption: "${caption}"`);
  return caption;
}
