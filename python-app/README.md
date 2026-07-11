# Player Dashboard — Python / Streamlit App

A Premier League player dashboard built with **Python**, **Streamlit**, and **Matplotlib**.
Mirrors all features of the React version.

> **New here?** Follow the full setup guide in the [root README](../README.md) first — it covers cloning, API key setup, and running both apps together.

---

## Features

| Tab | Description |
|---|---|
| **Player Browser** | Search by name, filter by position, sort by name / age / rating, view player card and grounded summary |
| **Compare Players** | Pick two players side-by-side to compare all their stats |
| **Team Formation** | Choose 4-4-2 / 4-3-3 / 3-5-2, generate a position-aware squad, view on a matplotlib football pitch with real player photos |

---

## Prerequisites

- [Python](https://python.org) 3.10 or higher
- `pip` (comes with Python)

---

## Setup (standalone — if running this app only)

### 1. Open a terminal in the `python-app/` folder

In VS Code press **Ctrl + `**, then run:
```powershell
cd python-app
```

### 2. Install dependencies
```powershell
pip install -r requirements.txt
```

### 3. Add player data

The app reads from `data/players.json`.

**Option A — copy from the React app** (recommended, after running its fetch script):
```powershell
# Windows PowerShell
copy ..\react-app\src\data\players.json data\players.json

# Mac / Linux
cp ../react-app/src/data/players.json data/players.json
```

**Option B — fetch manually** (requires Node.js and API key):
```powershell
cd ../react-app
node scripts/fetchPlayers.mjs
cd ../python-app
copy ..\react-app\src\data\players.json data\players.json
```

### 4. Run the app
```powershell
python -m streamlit run streamlit_app.py
```
Opens at **http://localhost:8501**

---

## Project structure

```
python-app/
├── data/
│   └── players.json         Player data — copy here from react-app (gitignored)
├── .streamlit/
│   └── config.toml          Pins Streamlit to port 8501
├── streamlit_app.py         Full Streamlit application
└── requirements.txt         Python dependencies
```

---

## Dependencies

| Package | Used for |
|---|---|
| `streamlit` | Web app framework |
| `matplotlib` | Drawing the football pitch |
| `Pillow` | Circular player photo thumbnails |
| `requests` | Downloading player photos |
| `numpy` | Image array manipulation |

---

## Notes

- Player photos are downloaded on first load and **cached** by Streamlit — subsequent loads are instant.
- The formation pitch uses `matplotlib` with `set_aspect("equal")` so all circles and arcs are geometrically correct.
- The app works without an API key — it only needs the `data/players.json` file.
