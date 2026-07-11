# Player Dashboard — Python / Streamlit App

A Premier League player dashboard built with **Python** and **Streamlit**.
Mirrors all features of the React version.

## Features

| Tab | Description |
|---|---|
| **Player Browser** | Search, filter by position, sort, select a player to see their stats and grounded summary |
| **Compare Players** | Pick two players side-by-side to compare their stats |
| **Team Formation** | Choose a formation (4-4-2, 4-3-3, 3-5-2), generate a position-aware squad, view it on a matplotlib pitch with real player photos |

## Project structure

```
python-app/
├── data/
│   └── players.json      Player data (copy from react-app after running fetch script)
├── streamlit_app.py      Main Streamlit application
└── requirements.txt      Python dependencies
```

## Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Add player data
Either:
- Copy `players.json` from the React app after running its fetch script:
  ```bash
  cp ../react-app/src/data/players.json data/players.json
  ```
- Or place your own `players.json` in the `data/` folder with this shape:
  ```json
  [
    {
      "name": "Player Name",
      "photo": "https://...",
      "position": "Attacker|Midfielder|Defender|Goalkeeper",
      "age": 25,
      "citizenship": "England",
      "club": "Arsenal",
      "rating": 7.5
    }
  ]
  ```

### 3. Run the app
```bash
python -m streamlit run streamlit_app.py
```
Opens at **http://localhost:8501**.

## Notes
- Player photos are fetched from the API on first load and cached by Streamlit.
- The formation pitch is rendered with `matplotlib` — real circular player photos with badge numbers.
