<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Moments app — a browser-based Wordle-like game where players upload a photo, AI picks a hidden word from the image, and the player guesses the word. PostHog is initialized via `instrumentation-client.js` (the Next.js 15.3+ approach), with all requests proxied through `/ingest` to avoid ad blockers. Exception tracking is enabled globally via `capture_exceptions: true`.

| Event | Description | File |
|---|---|---|
| `game_started` | User clicks the Play button on the start screen | `src/components/StartScreen.js` |
| `photo_uploaded` | User selects a photo file (includes file type and size) | `src/components/LoadingScreen.js` |
| `game_word_generated` | AI pipeline successfully generates a word (includes word length, source, total words) | `src/components/LoadingScreen.js` |
| `image_analysis_failed` | AI pipeline fails — captured as an exception via `captureException` | `src/components/LoadingScreen.js` |
| `guess_submitted` | User submits a word guess (includes guess number, word length, correct letters, correctness) | `src/components/Game.js` |
| `game_won` | User wins the game (includes attempts and word length) | `src/App.js` |
| `game_lost` | User loses the game (includes attempts and word length) | `src/App.js` |
| `play_again_clicked` | User clicks Play Again to guess the next word from the same photo | `src/App.js` |
| `new_picture_clicked` | User clicks New Picture to upload a different photo | `src/App.js` |
| `daily_limit_reached` | User hits the 2-photo-per-day limit — a churn signal | `src/App.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://eu.posthog.com/project/154038/dashboard/605720)
- **Game Conversion Funnel** — game_started → photo_uploaded → word_generated → game_won: [View insight](https://eu.posthog.com/project/154038/insights/L3YOyZO2)
- **Wins vs Losses** — daily win/loss counts: [View insight](https://eu.posthog.com/project/154038/insights/0OtEVRsH)
- **Daily Active Players** — unique players per day: [View insight](https://eu.posthog.com/project/154038/insights/Zwr9Nyvi)
- **Re-engagement: Play Again vs New Picture** — how players continue after a game: [View insight](https://eu.posthog.com/project/154038/insights/1rfm62vY)
- **Daily Limit Reached** — churn signal when users hit the daily cap: [View insight](https://eu.posthog.com/project/154038/insights/73jsPBhE)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
