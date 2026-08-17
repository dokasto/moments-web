# Moments

A photo-based Wordle. Upload a picture, and AI running **entirely in your browser** picks a hidden word (3–7 letters) from the image. Guess the word in 6 tries. Your photo never leaves your device.

## Preview
https://momentsgame.com/

## How It Works

1. Upload any photo.
2. An on-device vision model (Hugging Face Transformers) captions the image and selects a secret word.
3. Guess the word Wordle-style — green = correct spot, yellow = wrong spot, grey = not in the word.

Built with Next.js, React 19, and Framer Motion.

## Development

```bash
npm install
npm run dev        # start dev server
npm run build      # production build
npm start          # serve production build
```
