# Karaoke

A branching-story web app for coordinating a karaoke party for the homies.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

- **`/`** — Landing page. Enter a name to start playing.
- **`/play/[name]`** — Player screen. Shows story text and choice buttons. Progress saved in localStorage.
- **`/admin`** — DM screen. View player progress, jump to any node, reset progress.

## Story Editing

Edit `data/story.json` to add or modify story nodes:

```json
{
  "node_id": {
    "text": "What the player sees.",
    "choices": [
      { "label": "Button text", "next": "other_node_id" }
    ]
  }
}
```

Mark unfinished branches with `"isComingSoon": true` and empty choices.

## Deploy

Push to Vercel. Enable Password Protection in project settings for a simple gate.
