# Player Dashboard — React App

A Premier League player dashboard built with **React** and the **Carbon Design System**.

> **New here?** Follow the full setup guide in the [root README](../README.md) first — it covers cloning, API key setup, and running both apps together.

---

## Features

| Page | Description |
|---|---|
| **Player Browser** | Search by name, filter by position, sort by name / age / rating, view player card and grounded summary |
| **Compare Players** | Pick two players side-by-side to compare all their stats |
| **Team Formation** | Choose 4-4-2 / 4-3-3 / 3-5-2, generate a position-aware squad, view on an interactive pitch with hover tooltips and click-to-inspect panel |

---

## Prerequisites

- [Node.js](https://nodejs.org) v18 or higher (includes `npm`)
- [Yarn](https://yarnpkg.com) — install with `npm install -g yarn`

---

## Setup (standalone — if running this app only)

### 1. Open a terminal in the `react-app/` folder

In VS Code press **Ctrl + `**, then run:
```powershell
cd react-app
```

### 2. Install dependencies
```powershell
yarn install
```

### 3. Get your API key

1. Register at **https://dashboard.api-football.com/register** (free)
2. Go to **My Account → API Key** and copy your key

### 4. Create the `.env` file

Create a file called `.env` **inside the `react-app/` folder** (not the project root):
```
REACT_APP_API_FOOTBALL_KEY=paste_your_key_here
```

> This file is gitignored — your key will never be pushed to GitHub.

### 5. Fetch player data
```powershell
node scripts/fetchPlayers.mjs
```
This downloads Premier League player stats and saves them to `src/data/players.json`.

### 6. Start the app
```powershell
yarn start:dev
```
Opens at **http://localhost:3000**

---

## Project structure

```
react-app/
├── public/                  Static HTML, icons
├── scripts/
│   └── fetchPlayers.mjs     Downloads player data from API-Football
├── server/
│   └── server.js            Express server for production build
├── src/
│   ├── components/
│   │   ├── FormationBoard/  Football pitch + player tokens
│   │   ├── PlayerCard/      Player stat card
│   │   ├── PlayerCompare/   Side-by-side comparison
│   │   ├── PlayerSearch/    Name search bar
│   │   ├── PlayerSelect/    Player dropdown
│   │   ├── PlayerSort/      Sort dropdown
│   │   ├── PlayerSummary/   Grounded text summary
│   │   └── PositionFilter/  Position filter dropdown
│   ├── data/
│   │   └── players.json     Generated player data (gitignored)
│   ├── utils/
│   │   └── teamGenerator.js Position-aware squad picker
│   ├── App.jsx              Main app — navigation + page routing
│   └── index.js             Entry point
├── .env                     Your API key — create this (gitignored)
├── .env.development         Sets PORT=3000 for dev server
├── package.json
└── yarn.lock
```

---

## Available scripts

| Command | What it does |
|---|---|
| `yarn start:dev` | Start dev server at http://localhost:3000 |
| `yarn build` | Build for production into `build/` |
| `node server/server.js` | Serve the production build |
| `yarn test` | Run unit tests |
| `node scripts/fetchPlayers.mjs` | Fetch player data from API-Football |

---

## Build for production

```powershell
yarn build
node server/server.js
```

Serves the production build at **http://localhost:3000**.
