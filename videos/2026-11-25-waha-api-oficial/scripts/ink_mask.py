"""Turn Kie's black-on-white icons into trimmed alpha masks in public/ink/<id>.png.

Source: work/icons/<STYLE>-<id>.png (hand-drawn line styles from scripts/kie_icons.py). STYLE "b" = fine ballpoint,
the one he chose on 2026-11-26; its line is thickened a little so it survives the 190 px on-screen size.

The mask is white with alpha = ink darkness, so Remotion can tint it with any Koan color via CSS mask-image.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

STYLE = "b"
THICKEN = 7  # px at 1024: MinFilter grows the dark line

OUT = Path("public/ink")
OUT.mkdir(parents=True, exist_ok=True)
for src in sorted(Path("work/icons").glob(f"{STYLE}-*.png")):
    gray = np.asarray(Image.open(src).convert("L").filter(ImageFilter.MinFilter(THICKEN)), dtype=float)
    alpha = np.clip((235 - gray) / 110, 0, 1)  # near-white paper → 0, line → 1
    ys, xs = np.nonzero(alpha > 0.15)
    pad = 12
    y0, y1, x0, x1 = max(ys.min() - pad, 0), ys.max() + pad, max(xs.min() - pad, 0), xs.max() + pad
    a = (alpha[y0:y1, x0:x1] * 255).astype(np.uint8)
    rgba = np.dstack([np.full_like(a, 255)] * 3 + [a])
    img = Image.fromarray(rgba, "RGBA")
    img.thumbnail((512, 512))
    dst = OUT / (src.stem.split("-", 1)[1] + ".png")
    img.save(dst)
    print(dst, img.size)
