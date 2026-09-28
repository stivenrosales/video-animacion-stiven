#!/usr/bin/env python3
"""Pixel-art hero for the README: Clawd, Claude Code's mascot, painting a reel.

Every pixel is defined here as ASCII art. Regenerate with:

    python3 docs/art/clawd.py            # writes docs/assets/clawd-painter.svg

Clawd's silhouette comes from the Claude Code welcome logo
(" ▐▛███▜▌ / ▝▜█████▛▘ / ▘▘ ▝▝ "): each quadrant block becomes a 1x2 cell,
then everything is doubled so the body is 24x16 pixels.
"""
from pathlib import Path

P = 10  # one art pixel = 10 SVG units
W, H = 96, 48  # art size in pixels (960 x 480)
OUT = Path(__file__).resolve().parents[1] / "assets" / "clawd-painter.svg"

C = {
    "bg": "#FAF9F5",
    "line": "#E8E6DC",
    "dot": "#ECE9E0",
    "shadow": "#E4E0D4",
    "clawd": "#D97757",
    "clawdHi": "#E6957A",
    "clawdLo": "#C4654A",
    "eye": "#141413",
    "beret": "#2B2A3A",
    "beretHi": "#4A4860",
    "beretLo": "#1C1B27",
    "wood": "#B07A4A",
    "woodLo": "#8B5A2B",
    "woodHi": "#C99466",
    "paletteWood": "#E9C89B",
    "paletteLo": "#C9A274",
    "steel": "#B9B6AC",
    "steelLo": "#8C8A83",
    "canvas": "#FFFFFF",
    "canvasEdge": "#DDD8CB",
    "ink": "#141413",
    "accent": "#C15F3C",
    "muted": "#6B6A65",
    "faint": "#C9C6BC",
    "chip": "#F0EEE6",
    "blue": "#2F7FD8",
    "orange": "#D98A2B",
    "purple": "#8B72D2",
    "green": "#3F9A5B",
    "gold": "#F7C95B",
    "pink": "#F06FA8",
    "white": "#FFFFFF",
    "sky1": "#9CC3E6",
    "sky2": "#B9D6EF",
    "sky3": "#D3E5F3",
    "field": "#D8C79F",
    "silhouette": "#2B2A3A",
    "board": "#232228",
    "boardHi": "#35343C",
    "chalk": "#EDEBE4",
    "red": "#FF5F57",
    "yellow": "#FEBC2E",
    "greenDot": "#28C840",
}


class Layer:
    """A set of pixels rendered as one <g>, so it can be animated as a unit."""

    def __init__(self, cls: str = ""):
        self.cls = cls
        self.px: dict[tuple[int, int], str] = {}

    def put(self, x: int, y: int, color: str) -> None:
        self.px[(x, y)] = C[color]

    def rect(self, x0: int, y0: int, x1: int, y1: int, color: str) -> None:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.put(x, y, color)

    def sprite(self, ox: int, oy: int, rows: list[str], key: dict[str, str]) -> None:
        for dy, row in enumerate(rows):
            for dx, ch in enumerate(row):
                if ch in key:
                    self.put(ox + dx, oy + dy, key[ch])

    def svg(self) -> str:
        # Merge horizontal runs of the same color into one rect per run.
        rects = []

        def emit(x0: int, x1: int, y: int, color: str) -> None:
            rects.append(f'<rect x="{x0 * P}" y="{y * P}" width="{(x1 - x0 + 1) * P}" height="{P}" fill="{color}"/>')

        for y in sorted({y for _, y in self.px}):
            xs = sorted(x for (x, yy) in self.px if yy == y)
            start = prev = xs[0]
            color = self.px[(start, y)]
            for x in xs[1:]:
                c = self.px[(x, y)]
                if x == prev + 1 and c == color:
                    prev = x
                    continue
                emit(start, prev, y, color)
                start = prev = x
                color = c
            emit(start, prev, y, color)
        cls = f' class="{self.cls}"' if self.cls else ""
        return f"<g{cls}>" + "".join(rects) + "</g>"


# ---------------------------------------------------------------- Clawd
CLAWD_BASE = [  # 18 x 10, square pixels (quadrant rows doubled)
    "...############...",
    "...############...",
    "...############...",  # eyes are drawn on top
    "...############...",  # eyes are drawn on top
    ".################.",
    ".################.",
    "...############...",
    "...############...",
    "....#.#....#.#....",
    "....#.#....#.#....",
]
OX, OY = 29, 24  # Clawd's top-left in art pixels


def clawd_body() -> Layer:
    body = Layer()
    for by, row in enumerate(CLAWD_BASE):
        for bx, ch in enumerate(row):
            if ch == "#":
                body.rect(OX + bx * 2, OY + by * 2, OX + bx * 2 + 1, OY + by * 2 + 1, "clawd")
    # Soft pixel shading: a lit top-left rim and a darker belly line.
    for x in range(OX + 6, OX + 12):
        body.put(x, OY, "clawdHi")
    body.put(OX + 6, OY + 1, "clawdHi")
    for x in range(OX + 7, OX + 29):
        body.put(x, OY + 15, "clawdLo")
    for y in (*range(OY + 1, OY + 8), *range(OY + 12, OY + 16)):  # skip the arm rows
        body.put(OX + 29, y, "clawdLo")
    return body


def clawd_legs() -> Layer:
    legs = Layer()
    for bx in (4, 6, 11, 13):
        legs.rect(OX + bx * 2, OY + 16, OX + bx * 2 + 1, OY + 19, "clawdLo")
    return legs


def clawd_eyes() -> Layer:
    eyes = Layer("eyes")
    for bx in (5, 12):
        eyes.rect(OX + bx * 2, OY + 4, OX + bx * 2 + 1, OY + 7, "eye")
    return eyes


def beret() -> Layer:
    b = Layer()
    b.sprite(
        OX + 3,
        OY - 7,
        [
            "..........bb..............",
            "..........bb..............",
            "......bbbbbbbbbbbb........",
            "...bbhhhhhbbbbbbbbbbb.....",
            ".bbhhhbbbbbbbbbbbbbbbbb...",
            "bbbbbbbbbbbbbbbbbbbbbbbbb.",
            ".LLLLLLLLLLLLLLLLLLLLLLL..",
        ],
        {"b": "beret", "h": "beretHi", "L": "beretLo"},
    )
    return b


def timeline() -> tuple[Layer, Layer]:
    """A floating editor window: video, caption and SFX tracks under a moving playhead."""
    t = Layer()
    x0, y0, x1, y1 = 4, 4, 31, 15
    t.rect(x0 + 1, y0, x1 - 1, y1, "board")  # pixel-rounded corners
    t.rect(x0, y0 + 1, x1, y1 - 1, "board")
    t.rect(x0 + 1, y0, x1 - 1, y0 + 1, "boardHi")
    t.rect(x0, y0 + 1, x1, y0 + 1, "boardHi")
    for i, color in enumerate(("red", "yellow", "greenDot")):
        t.put(x0 + 2 + i * 2, y0 + 1, color)
    for a, b in ((6, 13), (15, 22), (24, 29)):  # video clips
        t.rect(a, 8, b, 9, "clawd")
    for a, b in ((6, 8), (10, 12), (14, 17), (19, 21), (23, 27)):  # caption clips
        t.rect(a, 11, b, 11, "gold")
    for a in (7, 11, 16, 20, 25, 28):  # SFX hits
        t.put(a, 13, "blue")
    head = Layer("playhead")
    head.rect(6, 7, 6, 14, "red")
    head.rect(5, 6, 7, 6, "red")
    return t, head


# ---------------------------------------------------------------- props
def palette() -> Layer:
    p = Layer()
    p.sprite(
        17,
        32,
        [
            "....#########....",
            "..#############..",
            ".##BB#GG#EE#####.",
            "###BB#GG#EE###oo#",
            "#####VV#RR####oo#",
            "#####VV#RR#######",
            ".#WW############.",
            "..#WW#########d..",
            "....ddddddddd....",
        ],
        {
            "#": "paletteWood",
            "d": "paletteLo",
            "B": "blue",
            "G": "gold",
            "E": "green",
            "V": "purple",
            "R": "pink",
            "W": "white",
            "o": "clawd",
        },
    )
    return p


def brush() -> Layer:
    b = Layer("brush")
    hx, hy = OX + 34, OY + 9  # grip just past the right arm
    for i in range(10):
        x, y = hx + i, hy - i
        if i < 6:
            b.put(x, y, "woodLo")
            b.put(x, y + 1, "wood")
        elif i < 8:
            b.put(x, y, "steelLo")
            b.put(x, y + 1, "steel")
        else:
            b.put(x, y, "blue")
            b.put(x, y + 1, "blue")
    return b


def easel() -> Layer:
    e = Layer()
    e.rect(78, 2, 79, 5, "woodLo")  # mast
    e.rect(77, 2, 80, 2, "wood")
    e.rect(69, 5, 88, 38, "canvasEdge")  # canvas edge
    e.rect(70, 6, 87, 37, "canvas")
    e.rect(76, 4, 81, 5, "wood")  # top clamp
    e.rect(66, 39, 91, 39, "woodHi")  # tray
    e.rect(67, 40, 90, 40, "woodLo")
    for x0, dx in ((68, -1), (78, 0), (88, 1)):  # splayed legs
        for i, y in enumerate(range(41, 44)):
            e.rect(x0 + dx * i, y, x0 + dx * i + 1, y, "wood")
    return e


# The reel being painted lives in canvas coordinates (u, v), 18 x 32.
CU, CV = 70, 6


def painted(cls: str) -> Layer:
    return Layer(f"paint {cls}")


def headline() -> Layer:
    h = painted("p1")
    h.rect(CU + 3, CV + 2, CU + 14, CV + 2, "ink")
    h.rect(CU + 3, CV + 3, CU + 8, CV + 3, "ink")
    h.rect(CU + 10, CV + 3, CU + 14, CV + 3, "accent")
    return h


def menu_card() -> Layer:
    m = painted("p2")
    m.rect(CU + 2, CV + 6, CU + 15, CV + 17, "line")
    m.rect(CU + 3, CV + 7, CU + 14, CV + 16, "white")
    return m


def menu_item(n: int, color: str, chip: bool) -> Layer:
    it = painted(f"p{3 + n}")
    v = CV + 8 + n * 3
    it.rect(CU + 4, v, CU + 5, v + 1, color)
    it.rect(CU + 7, v, CU + 11, v, "muted")
    it.rect(CU + 7, v + 1, CU + 9, v + 1, "faint")
    if chip:
        it.rect(CU + 12, v + 1, CU + 13, v + 1, "chip")
    return it


def hover() -> Layer:
    h = Layer("hover")
    v = CV + 8
    h.rect(CU + 3, v - 1, CU + 14, v + 1, "chip")
    return h


def caption_chip() -> Layer:
    c = painted("p6")
    v = CV + 19
    c.rect(CU + 4, v, CU + 13, v + 2, "ink")
    c.rect(CU + 5, v + 1, CU + 8, v + 1, "white")
    c.rect(CU + 10, v + 1, CU + 12, v + 1, "gold")
    return c


def camera() -> Layer:
    c = painted("p7")
    v = CV + 23
    c.rect(CU + 2, v, CU + 15, v + 1, "sky1")
    c.rect(CU + 2, v + 2, CU + 15, v + 3, "sky2")
    c.rect(CU + 2, v + 4, CU + 15, v + 4, "sky3")
    c.rect(CU + 2, v + 5, CU + 15, v + 6, "field")
    c.sprite(
        CU + 5,
        v + 1,
        [
            "..ssss..",
            ".ssssss.",
            ".ssssss.",
            "..ssss..",
            ".ssssss.",
            "ssssssss",
        ],
        {"s": "silhouette"},
    )
    return c


def progress() -> tuple[Layer, Layer]:
    track = Layer()
    track.rect(CU + 1, CV + 31 - 1, CU + 16, CV + 31 - 1, "line")
    fill = Layer("progress")
    fill.rect(CU + 1, CV + 30, CU + 16, CV + 30, "clawd")
    return track, fill


def clapperboard() -> tuple[Layer, Layer]:
    stick = Layer("clap")
    stick.sprite(4, 36, ["kwwkkwwkkwwk"], {"k": "board", "w": "chalk"})
    board = Layer()
    board.sprite(
        4,
        37,
        [
            "wkkwwkkwwkkw",
            "kkkkkkkkkkkk",
            "kwwwwwwwwwwk",
            "kkkkkkkkkkkk",
            "kwwww.kwwwwk",
            "kkkkkkkkkkkk",
            "kkkkkkkkkkkk",
        ],
        {"k": "board", "w": "chalk"},
    )
    return stick, board


def sparkles() -> list[Layer]:
    out = []
    for i, (x, y, color) in enumerate(((64, 8, "gold"), (92, 14, "blue"), (22, 18, "gold"), (60, 18, "pink"))):
        s = Layer(f"spark s{i}")
        s.put(x, y, color)
        s.put(x - 1, y, color)
        s.put(x + 1, y, color)
        s.put(x, y - 1, color)
        s.put(x, y + 1, color)
        out.append(s)
    return out


def floor() -> Layer:
    f = Layer()
    f.rect(2, 44, 93, 44, "line")
    f.rect(OX + 5, 44, OX + 30, 44, "shadow")
    f.rect(65, 44, 92, 44, "shadow")
    for x, color in ((61, "blue"), (62, "blue"), (64, "gold")):  # paint drips on the floor
        f.put(x, 43, color)
    return f


CSS = """
.eyes{animation:blink 4.2s infinite;transform-box:fill-box;transform-origin:center}
.look{animation:look 6s steps(1,end) infinite}
.brush{animation:dab .9s steps(1,end) infinite}
.paint{opacity:0;animation:8s steps(1,end) infinite}
.p1{animation-name:p1}.p2{animation-name:p2}.p3{animation-name:p3}.p4{animation-name:p4}
.p5{animation-name:p5}.p6{animation-name:p6}.p7{animation-name:p7}
.hovergrp{opacity:0;animation:p5 8s steps(1,end) infinite}
.hover{animation:hover 8s steps(3,end) infinite}
.progress{animation:grow 8s linear infinite;transform-box:fill-box;transform-origin:left}
.clap{animation:clap 4s steps(1,end) infinite}
.playhead{animation:play 8s steps(22,end) infinite}
@keyframes play{0%{transform:translateX(0)}100%{transform:translateX(220px)}}
.spark{opacity:0;animation:twinkle 2.4s steps(1,end) infinite}
.s1{animation-delay:.6s}.s2{animation-delay:1.2s}.s3{animation-delay:1.8s}
@keyframes blink{0%,90%,100%{transform:scaleY(1)}93%,96%{transform:scaleY(.25)}}
@keyframes look{0%{transform:translateX(0)}35%{transform:translateX(10px)}80%{transform:translateX(0)}}
@keyframes dab{0%{transform:translate(0,0)}50%{transform:translate(-10px,10px)}}
@keyframes p1{0%{opacity:0}8%{opacity:1}94%{opacity:0}}
@keyframes p2{0%{opacity:0}20%{opacity:1}94%{opacity:0}}
@keyframes p3{0%{opacity:0}30%{opacity:1}94%{opacity:0}}
@keyframes p4{0%{opacity:0}38%{opacity:1}94%{opacity:0}}
@keyframes p5{0%{opacity:0}46%{opacity:1}94%{opacity:0}}
@keyframes p6{0%{opacity:0}60%{opacity:1}94%{opacity:0}}
@keyframes p7{0%{opacity:0}72%{opacity:1}94%{opacity:0}}
@keyframes hover{0%,55%{transform:translateY(0)}62%,72%{transform:translateY(30px)}79%,90%{transform:translateY(60px)}97%,100%{transform:translateY(0)}}
@keyframes grow{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
@keyframes clap{0%{transform:translateY(-10px)}8%{transform:translateY(0)}}
@keyframes twinkle{0%{opacity:1}30%{opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.paint,.hovergrp{opacity:1}}
"""


def build() -> str:
    stick, board = clapperboard()
    track, fill = progress()
    items = [menu_item(0, "blue", False), menu_item(1, "orange", True), menu_item(2, "purple", False)]
    parts = [
        floor(),
        easel(),
        track,
        fill,
        headline(),
        menu_card(),
        *items,
        caption_chip(),
        camera(),
    ]
    # The hover band slides under the menu rows; the cursor rides on top of them.
    hover_band = '<g class="hovergrp">' + hover().svg() + "</g>"
    panel, playhead = timeline()
    front = [clawd_legs(), clawd_body(), beret(), palette(), board, stick]
    body = (
        panel.svg()
        + playhead.svg()
        + "".join(p.svg() for p in parts[:6])
        + hover_band
        + "".join(i.svg() for i in items)
        + "".join(p.svg() for p in parts[9:])
        + "".join(p.svg() for p in front)
        + '<g class="look">'
        + clawd_eyes().svg()
        + "</g>"
        + brush().svg()
        + "".join(s.svg() for s in sparkles())
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W * P} {H * P}" width="{W * P}" height="{H * P}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">Clawd painting a reel</title>
<desc id="d">Pixel art of Clawd, Claude Code's orange mascot, wearing a beret and painting a vertical reel on an easel, with a palette and a clapperboard.</desc>
<style>{CSS}</style>
<defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="2" height="2" fill="{C['dot']}"/></pattern></defs>
<rect x="1" y="1" width="{W * P - 2}" height="{H * P - 2}" rx="28" fill="{C['bg']}" stroke="{C['line']}" stroke-width="2"/>
<rect x="20" y="20" width="{W * P - 40}" height="{H * P - 40}" rx="16" fill="url(#dots)"/>
{body}
</svg>
"""


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(build())
    print(f"wrote {OUT.relative_to(Path.cwd()) if OUT.is_relative_to(Path.cwd()) else OUT}")
