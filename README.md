# Premier League Player Dashboard

A Premier League player dashboard with two implementations running on separate ports:

| Folder | Stack | Port |
|---|---|---|
| [`react-app/`](react-app/) | React + Carbon Design System | **http://localhost:3000** |
| [`python-app/`](python-app/) | Python + Streamlit + Matplotlib | **http://localhost:8501** |

Both apps share the same `players.json` dataset fetched from API-Football.

## Run both apps at the same time

```bash
# Install concurrently (one-time)
npm install

# Launch both apps side-by-side
npm run start:all
```

React opens at **http://localhost:3000** and Streamlit at **http://localhost:8501** simultaneously, each with colour-coded log output in the same terminal.

## Run individually

### React app
```bash
cd react-app
yarn install
yarn start:dev
# → http://localhost:3000
```

### Python app
```bash
cd python-app
pip install -r requirements.txt
python -m streamlit run streamlit_app.py
# → http://localhost:8501
```

## First-time setup: get player data

```bash
cd react-app
# Add your API key to react-app/.env:
#   REACT_APP_API_FOOTBALL_KEY=your_key_here
node scripts/fetchPlayers.mjs

# Copy the data for the Python app too:
cp src/data/players.json ../python-app/data/players.json
```

## Features (both apps)

- **Player Browser** — search, filter by position, sort, view player card + summary
- **Compare Players** — two players side-by-side
- **Team Formation** — 4-4-2 / 4-3-3 / 3-5-2 with position-aware squad generation and pitch visualisation

## Data source
Player data is fetched from [API-Football](https://www.api-sports.io/) (free plan, 2023 Premier League season).
