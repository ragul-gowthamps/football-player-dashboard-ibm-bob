# Premier League Player Dashboard

A Premier League player dashboard with two implementations running on separate ports:

| Folder | Stack | URL |
|---|---|---|
| [`react-app/`](react-app/) | React + Carbon Design System | http://localhost:3000 |
| [`python-app/`](python-app/) | Python + Streamlit + Matplotlib | http://localhost:8501 |

---

## Prerequisites

Before you start, make sure you have these installed:

| Tool | Why you need it | Download |
|---|---|---|
| **Node.js** (v18+) | Runs the React app and fetch script | https://nodejs.org → choose **LTS** |
| **Yarn** | React package manager | Run `npm install -g yarn` after Node |
| **Python** (v3.10+) | Runs the Streamlit app | https://python.org → choose **3.12 LTS** |
| **Git** | Clone and push the repo | https://git-scm.com |
| **VS Code** | Code editor | https://code.visualstudio.com |

---

## Step 1 — Get an API key

The player data is fetched from **API-Football** (free plan).

1. Go to **https://dashboard.api-football.com/register**
2. Create a free account
3. After logging in, go to **My Account → API Key**
4. Copy your key — you will need it in Step 4

> The free plan gives you 100 requests/day which is enough to fetch all players once.

---

## Step 2 — Clone the repository

1. Open **VS Code**
2. Press `Ctrl + Shift + P` → type **Git: Clone** → press Enter
3. Paste your repo URL (e.g. `https://github.com/YOUR_USERNAME/player-dashboard.git`)
4. Choose a folder to save it in (e.g. `C:\Projects\`)
5. When prompted, click **Open** to open the cloned folder in VS Code

**Or clone from terminal:**
```powershell
cd C:\Projects
git clone https://github.com/YOUR_USERNAME/player-dashboard.git
cd player-dashboard
```

---

## Step 3 — Open in VS Code with IBM Bob

1. Open VS Code
2. Click **File → Open Folder**
3. Navigate to and select the `player-dashboard` folder (the one containing `react-app/`, `python-app/`, and `README.md`)
4. Click **Select Folder**

> **Important:** Open the **root** `player-dashboard` folder — not `react-app/` or `python-app/` individually. IBM Bob works best when it can see the whole project.

To open IBM Bob, click the **Bob icon** in the VS Code sidebar (left panel).

---

## Step 4 — Add your API key

1. In VS Code, look at the **Explorer** panel on the left
2. Open the `react-app/` folder
3. Create a new file called **`.env`** inside `react-app/` (not the root)
4. Add this line, replacing the placeholder with your actual key:

```
REACT_APP_API_FOOTBALL_KEY=paste_your_key_here
```

5. Save the file (`Ctrl + S`)

> This file is in `.gitignore` — it will **never** be uploaded to GitHub. Your key stays private.

---

## Step 5 — Open a terminal in VS Code

Press **Ctrl + ` ** (backtick key, top-left of keyboard) to open the integrated terminal.

Make sure the terminal shows the project root path, e.g.:
```
PS C:\Projects\player-dashboard>
```

If it shows a different folder, run:
```powershell
cd "C:\Projects\player-dashboard"
```

---

## Step 6 — Install dependencies (one time only)

```powershell
# Install root tool (concurrently — launches both apps together)
npm install

# Install React app dependencies
npm run setup

# Install Python app dependencies
pip install -r python-app/requirements.txt
```

---

## Step 7 — Fetch player data (one time only)

```powershell
# Fetch Premier League players from API-Football
node react-app/scripts/fetchPlayers.mjs

# Copy the data to the Python app
copy react-app\src\data\players.json python-app\data\players.json
```

This creates `players.json` with Premier League player stats from the 2023 season.

---

## Step 8 — Run both apps

```powershell
npm run start:all
```

Both apps launch simultaneously with colour-coded logs:

```
[REACT]  Compiled successfully!
[REACT]  → http://localhost:3000

[PYTHON] You can now view your Streamlit app in your browser.
[PYTHON] → http://localhost:8501
```

Open both URLs in your browser.

---

## Run apps individually

```powershell
# React only
npm run start:react

# Python only
npm run start:python
```

---

## Features (both apps)

| Feature | Description |
|---|---|
| **Player Browser** | Search by name, filter by position, sort by name/age/rating, view player card and summary |
| **Compare Players** | Select two players side-by-side to compare all their stats |
| **Team Formation** | Pick 4-4-2 / 4-3-3 / 3-5-2, generate a position-aware squad, see players on a football pitch |

---

## Project structure

```
player-dashboard/                ← Open THIS folder in VS Code
├── react-app/                   ← React + Carbon app (port 3000)
│   ├── src/                     
│   │   ├── components/          All UI components
│   │   ├── data/players.json    Generated player data
│   │   └── utils/               Helper functions
│   ├── scripts/fetchPlayers.mjs Data fetch script
│   ├── .env                     Your API key (create this — never committed)
│   └── package.json
├── python-app/                  ← Streamlit app (port 8501)
│   ├── data/players.json        Copy of player data
│   ├── streamlit_app.py         Main Python app
│   └── requirements.txt
├── package.json                 Root scripts (start:all, setup)
└── README.md                    ← You are here
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm not recognized` | Node.js is not installed — download from https://nodejs.org |
| `yarn not recognized` | Run `npm install -g yarn` in terminal |
| `python not recognized` | Python is not installed — download from https://python.org |
| React shows empty dropdown | Run the fetch script (Step 7) to generate `players.json` |
| `REACT_APP_API_FOOTBALL_KEY is not set` | Create `react-app/.env` with your API key (Step 4) |
| Port 3000 already in use | Another app is using that port — close it or restart your computer |
