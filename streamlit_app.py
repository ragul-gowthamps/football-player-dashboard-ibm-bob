"""
Player Dashboard — Streamlit edition
Mirrors the React app: Player Browser, Compare Players, Team Formation.

Run:
    streamlit run streamlit_app.py
"""

import json
import math
import random
from pathlib import Path

import matplotlib.patches as mpatches
import matplotlib.pyplot as plt
import numpy as np
import requests
import streamlit as st
from PIL import Image, ImageDraw
from io import BytesIO
from matplotlib.offsetbox import AnnotationBbox, OffsetImage

# ─── Data loading ─────────────────────────────────────────────────────────────

# Looks for data/players.json next to this file (python-app/data/players.json).
# Copy src/data/players.json here after running the fetch script.
DATA_FILE = Path(__file__).parent / "data" / "players.json"


@st.cache_data
def load_players():
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


@st.cache_data(show_spinner=False)
def fetch_photo(url: str):
    """Download a player photo and return a PIL Image, or None on failure."""
    try:
        resp = requests.get(url, timeout=4)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content)).convert("RGBA")
    except Exception:
        return None


# ─── Helpers ──────────────────────────────────────────────────────────────────

POSITIONS = ["Attacker", "Midfielder", "Defender", "Goalkeeper"]

SORT_OPTIONS = {
    "Name (A → Z)":        lambda p: p.get("name", ""),
    "Name (Z → A)":        lambda p: -(ord(p.get("name", " ")[0])),  # proxy; real sort below
    "Age (youngest first)": lambda p: p.get("age") or 999,
    "Rating (best first)":  lambda p: -(p.get("rating") or 0),
}


def sort_players(players, sort_label):
    if sort_label == "Name (A → Z)":
        return sorted(players, key=lambda p: p.get("name", ""))
    elif sort_label == "Name (Z → A)":
        return sorted(players, key=lambda p: p.get("name", ""), reverse=True)
    elif sort_label == "Age (youngest first)":
        return sorted(players, key=lambda p: p.get("age") or 999)
    elif sort_label == "Rating (best first)":
        return sorted(players, key=lambda p: -(p.get("rating") or 0))
    return players


def fmt_rating(rating):
    if rating is None:
        return "—"
    return f"{float(rating):.1f} / 10"


def form_description(rating):
    if rating is None:
        return None
    r = float(rating)
    if r >= 8.0:
        return "in strong form"
    if r >= 6.0:
        return "showing consistent form"
    return "building form"


def build_summary(player):
    parts = []
    name = player.get("name", "Unknown")
    position = player.get("position")
    club = player.get("club")
    age = player.get("age")
    citizenship = player.get("citizenship")
    rating = player.get("rating")

    opening = " ".join(filter(None, [
        name,
        f"is a {position}" if position else None,
        f"playing for {club}" if club else None,
    ]))
    parts.append(f"{opening}.")

    personal = list(filter(None, [
        f"{age} years old" if age else None,
        f"a {citizenship} international" if citizenship else None,
    ]))
    if personal:
        parts.append(f"{name} is {' and '.join(personal)}.")

    form = form_description(rating)
    if form:
        parts.append(f"{name} is currently {form}.")

    parts.append("This profile is based on the available dataset only.")
    return " ".join(parts)


def fisher_yates(lst):
    lst = list(lst)
    for i in range(len(lst) - 1, 0, -1):
        j = random.randint(0, i)
        lst[i], lst[j] = lst[j], lst[i]
    return lst


def generate_team_by_formation(all_players, fwd, mid, def_):
    def pick(pos, n):
        pool = fisher_yates([p for p in all_players if p.get("position") == pos])
        return pool[:n]

    forwards    = pick("Attacker",   fwd)
    midfielders = pick("Midfielder", mid)
    defenders   = pick("Defender",   def_)
    goalkeepers = pick("Goalkeeper", 1)

    used = {p["name"] for p in forwards + midfielders + defenders + goalkeepers}
    bench = fisher_yates([p for p in all_players if p["name"] not in used])
    needed = 11 - len(forwards) - len(midfielders) - len(defenders) - len(goalkeepers)
    fillers = bench[:needed]

    return forwards + midfielders + defenders + goalkeepers + fillers


# ─── Formation layouts ────────────────────────────────────────────────────────
# Each row: (squad_indices, y_fraction, shirt_numbers)
# squad is ordered: forwards → midfielders → defenders → GK (index 10)

FORMATIONS = {
    "4-4-2": {
        "fwd": 2, "mid": 4, "def": 4,
        "rows": [
            ([0, 1],       0.12, [10, 11]),
            ([2, 3, 4, 5], 0.35, [6, 7, 8, 9]),
            ([6, 7, 8, 9], 0.62, [2, 3, 4, 5]),
            ([10],         0.87, [1]),
        ],
    },
    "4-3-3": {
        "fwd": 3, "mid": 3, "def": 4,
        "rows": [
            ([0, 1, 2],    0.12, [9, 10, 11]),
            ([3, 4, 5],    0.35, [6, 7, 8]),
            ([6, 7, 8, 9], 0.62, [2, 3, 4, 5]),
            ([10],         0.87, [1]),
        ],
    },
    "3-5-2": {
        "fwd": 2, "mid": 5, "def": 3,
        "rows": [
            ([0, 1],          0.12, [10, 11]),
            ([2, 3, 4, 5, 6], 0.35, [5, 6, 7, 8, 9]),
            ([7, 8, 9],       0.62, [2, 3, 4]),
            ([10],            0.87, [1]),
        ],
    },
}


# ─── Photo helpers ────────────────────────────────────────────────────────────

@st.cache_data(show_spinner=False)
def fetch_photo_array(url: str, size: int = 40):
    """
    Download a player photo, crop to circle, resize to `size`×`size`,
    and return an RGBA numpy array ready for OffsetImage.
    Returns None on failure.
    """
    try:
        resp = requests.get(url, timeout=4)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content)).convert("RGBA").resize((size, size), Image.LANCZOS)
        # Circular mask
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
        img.putalpha(mask)
        return np.array(img)
    except Exception:
        return None


# ─── Pitch drawing ────────────────────────────────────────────────────────────

def draw_pitch(squad, formation_key):
    """
    Draw a crisp vertical football pitch using matplotlib.
    Uses a square data coordinate system so all arcs/circles are true circles.
    Player photos are placed as OffsetImage annotations (pixel-perfect, no distortion).
    """
    # ── Canvas: 560 × 840 pt (same proportions as the React SVG field) ──
    # Work in data units where 1 unit = 1 pt → aspect=equal gives true circles.
    FW, FH = 560, 840          # field play surface size in data units
    PAD    = 30                # padding around field
    GOAL_H = 25                # goal rectangle height (outside field)

    CW = FW + PAD * 2
    CH = FH + PAD * 2 + GOAL_H * 2   # canvas: field + padding + goals top/bottom

    DPI = 100
    fig, ax = plt.subplots(figsize=(CW / DPI, CH / DPI), dpi=DPI)
    fig.patch.set_facecolor("#1e7a32")
    ax.set_facecolor("#1e7a32")
    ax.set_xlim(0, CW)
    ax.set_ylim(0, CH)
    ax.set_aspect("equal")      # ← TRUE circles now that data units are square
    ax.axis("off")
    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)

    # Helpers — field origin (fx, fy) maps field coords to canvas coords
    def fx(x): return PAD + x
    def fy(y): return GOAL_H + PAD + y   # y=0 → bottom of field

    CX = fx(FW / 2)            # centre x
    MID = fy(FH / 2)           # halfway line y

    lw = 1.8
    lc = "white"
    la = 0.92

    def line(x1, y1, x2, y2):
        ax.plot([x1, x2], [y1, y2], color=lc, lw=lw, alpha=la, zorder=2)

    def rect(x, y, w, h, **kw):
        ax.add_patch(mpatches.Rectangle(
            (x, y), w, h, fill=False,
            edgecolor=kw.get("ec", lc), lw=kw.get("lw", lw),
            alpha=kw.get("alpha", la), zorder=2,
            facecolor=kw.get("fc", "none"),
        ))

    def circle(cx, cy, r, **kw):
        ax.add_patch(mpatches.Circle(
            (cx, cy), r, fill=kw.get("fill", False),
            edgecolor=kw.get("ec", lc), facecolor=kw.get("fc", "none"),
            lw=kw.get("lw", lw), alpha=kw.get("alpha", la), zorder=kw.get("z", 2),
        ))

    def arc_path(cx, cy, r, t1, t2):
        ax.add_patch(mpatches.Arc(
            (cx, cy), r * 2, r * 2, angle=0, theta1=t1, theta2=t2,
            color=lc, lw=lw, alpha=la, zorder=2,
        ))

    # ── Grass stripes (alternating light/dark bands) ──
    stripe_w = FW / 8
    for i in range(8):
        fc = "#217a30" if i % 2 == 0 else "#1e7a32"
        ax.add_patch(mpatches.Rectangle(
            (fx(i * stripe_w), fy(0)), stripe_w, FH,
            facecolor=fc, edgecolor="none", zorder=0,
        ))

    # ── Pitch border & halfway line ──
    rect(fx(0), fy(0), FW, FH)
    line(fx(0), MID, fx(FW), MID)

    # ── Centre circle & spot ──
    R_C = 91          # ~9.15 m at ~1:10 scale
    circle(CX, MID, R_C)
    circle(CX, MID, 4, fill=True, fc=lc, ec=lc, z=3)

    # ── Penalty area dimensions ──
    PA_W = FW * 0.5       # penalty area width
    PA_H = FH * 0.155     # penalty area depth
    GA_W = PA_W * 0.5     # goal area width
    GA_H = PA_H * 0.38    # goal area depth
    P_OFF = PA_H * 0.71   # penalty spot from end line
    R_ARC = 91            # penalty arc radius (same as centre circle)

    # ── TOP penalty area (attackers end — top of display) ──
    tPA_x, tPA_y = fx(FW / 2 - PA_W / 2), fy(FH - PA_H)
    tGA_x, tGA_y = fx(FW / 2 - GA_W / 2), fy(FH - GA_H)
    tPS_y = fy(FH - P_OFF)
    rect(tPA_x, tPA_y, PA_W, PA_H)
    rect(tGA_x, tGA_y, GA_W, GA_H)
    circle(CX, tPS_y, 4, fill=True, fc=lc, ec=lc, z=3)
    # D-arc: centre=penalty spot, bulges away from goal (downward for top)
    tArc_y = tPA_y           # the penalty box bottom edge
    dy = tArc_y - tPS_y
    disc = R_ARC**2 - dy**2
    if disc >= 0:
        dx = math.sqrt(disc)
        t1 = math.degrees(math.atan2(dy, -dx))   # left intersection angle
        t2 = math.degrees(math.atan2(dy,  dx))   # right intersection angle
        # Arc from left to right going BELOW tPS_y (sweep through bottom = away from goal)
        arc_path(CX, tPS_y, R_ARC, t1 % 360, t2 % 360 if t2 >= t1 else t2 + 360)

    # ── BOTTOM penalty area (goalkeeper end — bottom of display) ──
    bPA_x, bPA_y = fx(FW / 2 - PA_W / 2), fy(0)
    bGA_x, bGA_y = fx(FW / 2 - GA_W / 2), fy(0)
    bPS_y = fy(P_OFF)
    rect(bPA_x, bPA_y, PA_W, PA_H)
    rect(bGA_x, bGA_y, GA_W, GA_H)
    circle(CX, bPS_y, 4, fill=True, fc=lc, ec=lc, z=3)
    # D-arc: bulges upward for bottom end
    bArc_y = bPA_y + PA_H    # penalty box top edge
    dy = bArc_y - bPS_y
    disc = R_ARC**2 - dy**2
    if disc >= 0:
        dx = math.sqrt(disc)
        t1 = math.degrees(math.atan2(dy, -dx))
        t2 = math.degrees(math.atan2(dy,  dx))
        arc_path(CX, bPS_y, R_ARC, t2 % 360, (t1 % 360) + 360 if t1 <= t2 else t1 % 360)

    # ── Corner arcs ──
    R_CORNER = 18
    for (cx, cy, t1, t2) in [
        (fx(0),  fy(0),  0,   90),
        (fx(FW), fy(0),  90,  180),
        (fx(0),  fy(FH), 270, 360),
        (fx(FW), fy(FH), 180, 270),
    ]:
        arc_path(cx, cy, R_CORNER, t1, t2)

    # ── Goals (outside field, hatched net look) ──
    GOAL_W = PA_W * 0.46
    for gy, pattern in [(fy(FH), "//"), (fy(0) - GOAL_H, "\\\\")]:
        ax.add_patch(mpatches.Rectangle(
            (CX - GOAL_W / 2, gy), GOAL_W, GOAL_H,
            fill=True, facecolor="#1e7a32", edgecolor=lc, lw=lw, alpha=la,
            hatch=pattern, zorder=2,
        ))

    # ── Player tokens ──
    formation = FORMATIONS.get(formation_key, FORMATIONS["4-4-2"])
    rows = formation["rows"]
    PHOTO_PX = 44    # photo circle diameter in pixels

    for (indices, y_frac, numbers) in rows:
        count = len(indices)
        for col_idx, (squad_idx, number) in enumerate(zip(indices, numbers)):
            player = squad[squad_idx] if squad_idx < len(squad) else None

            # Position in data coords
            px = fx(FW * (col_idx + 1) / (count + 1))
            py = fy(FH * (1 - y_frac))   # y_frac=0 → top of field

            # ── Photo or fallback circle ──
            photo_arr = fetch_photo_array(player["photo"], PHOTO_PX) \
                        if player and player.get("photo") else None

            if photo_arr is not None:
                # White ring behind photo
                circle(px, py, PHOTO_PX / 2 + 3, ec=lc, lw=2, alpha=1.0, z=4)
                im = OffsetImage(photo_arr, zoom=1.0)
                ab = AnnotationBbox(im, (px, py), frameon=False, zorder=5,
                                    box_alignment=(0.5, 0.5))
                ax.add_artist(ab)
            else:
                circle(px, py, PHOTO_PX / 2, fill=True,
                       fc="#0f62fe", ec=lc, lw=2, alpha=1.0, z=4)

            # ── Shirt number badge (top-right of photo) ──
            badge_cx = px + PHOTO_PX * 0.38
            badge_cy = py + PHOTO_PX * 0.38
            circle(badge_cx, badge_cy, 14, fill=True,
                   fc="#0f62fe", ec="white", lw=1.5, alpha=1.0, z=6)
            ax.text(badge_cx, badge_cy, str(number),
                    color="white", fontsize=7, fontweight="bold",
                    ha="center", va="center", zorder=7)

            # ── Player name below ──
            short = player["name"].split()[-1] \
                    if player and " " in player.get("name", "") \
                    else (player["name"] if player else f"#{number}")
            ax.text(px, py - PHOTO_PX / 2 - 8, short,
                    color="white", fontsize=8, fontweight="bold",
                    ha="center", va="top", zorder=6,
                    bbox=dict(boxstyle="round,pad=0.25",
                              facecolor=(0, 0, 0, 0.5),
                              edgecolor="none"))

    return fig


# ─── Stat card ────────────────────────────────────────────────────────────────

def render_player_card(player, col=None):
    """Render a player stat card into `col` (or st directly if None)."""
    target = col if col else st
    photo_url = player.get("photo")
    if photo_url:
        img = fetch_photo(photo_url)
        if img:
            target.image(img, width=100)
    target.subheader(player.get("name", "—"))
    rows = [
        ("Position",    player.get("position")    or "—"),
        ("Age",         str(player.get("age"))     if player.get("age") else "—"),
        ("Nationality", player.get("citizenship")  or "—"),
        ("Club",        player.get("club")         or "—"),
        ("Rating",      fmt_rating(player.get("rating"))),
    ]
    for label, value in rows:
        target.markdown(f"**{label}:** {value}")


# ─── Page: Player Browser ─────────────────────────────────────────────────────

def page_browser(players):
    st.header("Player Browser")

    # Search
    search = st.text_input("🔍 Search by name", placeholder="Type a player name…")

    # Filters row
    col_pos, col_sort = st.columns(2)
    with col_pos:
        pos_options = ["All Positions"] + POSITIONS
        pos_filter = st.selectbox("Position", pos_options)
    with col_sort:
        sort_label = st.selectbox("Sort by", list(SORT_OPTIONS.keys()))

    # Apply pipeline: search → filter → sort
    result = players
    if search:
        result = [p for p in result if search.lower() in p.get("name", "").lower()]
    if pos_filter != "All Positions":
        result = [p for p in result if p.get("position") == pos_filter]
    result = sort_players(result, sort_label)

    if not result:
        st.info("No players match your filters.")
        return

    names = [p["name"] for p in result]
    selected_name = st.selectbox("Select a player", ["— Select a player —"] + names)

    if selected_name and selected_name != "— Select a player —":
        player = next((p for p in players if p["name"] == selected_name), None)
        if player:
            st.divider()
            render_player_card(player)
            st.divider()
            st.subheader("Player Summary")
            st.write(build_summary(player))
            st.caption("This summary is based only on the loaded dataset.")


# ─── Page: Compare Players ────────────────────────────────────────────────────

def page_compare(players):
    st.header("Compare Players")
    names = [p["name"] for p in players]
    placeholder = "— Select —"

    col_a, col_vs, col_b = st.columns([5, 1, 5])

    with col_a:
        name_a = st.selectbox("Player A", [placeholder] + names, key="cmp_a")
    with col_vs:
        st.markdown("<br><br><div style='text-align:center;font-size:1.4rem;font-weight:700'>VS</div>",
                    unsafe_allow_html=True)
    with col_b:
        name_b = st.selectbox("Player B", [placeholder] + names, key="cmp_b")

    player_a = next((p for p in players if p["name"] == name_a), None)
    player_b = next((p for p in players if p["name"] == name_b), None)

    if player_a or player_b:
        st.divider()
        left, right = st.columns(2)
        if player_a:
            with left:
                render_player_card(player_a, left)
        else:
            left.info("Select Player A")

        if player_b:
            with right:
                render_player_card(player_b, right)
        else:
            right.info("Select Player B")


# ─── Page: Team Formation ─────────────────────────────────────────────────────

def page_formation(players):
    st.header("Team Formation Visualizer")

    col_form, col_btn = st.columns([3, 2])
    with col_form:
        formation_key = st.selectbox("Formation", list(FORMATIONS.keys()))
    with col_btn:
        st.markdown("<br>", unsafe_allow_html=True)
        generate = st.button("Generate Team", type="primary", use_container_width=True)

    if "squad" not in st.session_state:
        st.session_state.squad = []

    if generate:
        f = FORMATIONS[formation_key]
        st.session_state.squad = generate_team_by_formation(
            players, fwd=f["fwd"], mid=f["mid"], def_=f["def"]
        )

    squad = st.session_state.squad
    if not squad:
        st.info("Click **Generate Team** to see the formation.")
        return

    # Draw pitch
    fig = draw_pitch(squad, formation_key)
    # Centre the figure — use columns to constrain width
    _, mid_col, _ = st.columns([1, 3, 1])
    with mid_col:
        st.pyplot(fig, use_container_width=True)
    plt.close(fig)

    # Squad list below the pitch
    st.divider()
    st.subheader("Squad")
    rows = FORMATIONS[formation_key]["rows"]
    for (indices, _, numbers) in rows:
        for squad_idx, number in zip(indices, numbers):
            if squad_idx < len(squad):
                p = squad[squad_idx]
                st.markdown(
                    f"**#{number}** {p.get('name','—')} — "
                    f"{p.get('position','—')} · {p.get('club','—')} · "
                    f"Rating: {fmt_rating(p.get('rating'))}"
                )


# ─── App entry point ──────────────────────────────────────────────────────────

def main():
    st.set_page_config(
        page_title="Player Dashboard",
        page_icon="⚽",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    st.title("⚽ Player Dashboard")

    players = load_players()
    if not players:
        st.error(
            "No player data found. "
            "Run `node scripts/fetchPlayers.mjs` first to generate `src/data/players.json`."
        )
        return

    tab_browser, tab_compare, tab_formation = st.tabs([
        "🔍 Player Browser",
        "⚖️ Compare Players",
        "🏟️ Team Formation",
    ])

    with tab_browser:
        page_browser(players)

    with tab_compare:
        page_compare(players)

    with tab_formation:
        page_formation(players)


if __name__ == "__main__":
    main()
