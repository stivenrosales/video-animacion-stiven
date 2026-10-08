#!/usr/bin/env python3
"""Phone mockups of each style for the README gallery.

Grabs one frame per style from the published reels in finals/ (and the Liquid
Glass board), wraps it in a phone bezel with headless Chrome, and writes
docs/assets/styles/<style>.webp. finals/ and out/ are git-ignored, so this only
runs on the machine that rendered the reels.

    python3 docs/art/gallery.py
"""
import subprocess
import tempfile
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "assets" / "styles"
FRAMES = {  # style -> (published reel, second)
    "claude-ui": ("2026-09-27-workflows", 31.5),
    "ali-abdaal": ("2026-09-27-mcp-vs-whatsapp", 69.0),
    "sketch": ("2026-09-25-poema-milena-h264", 9.8),
    "ali-sketch": ("2026-09-28-fusion", 44.3),
    "claude-carousel": ("2026-10-07-cursos-ia", 40.6),
}
GLASS_BOARD = ROOT / "videos" / "2026-09-27-mcp-vs-whatsapp" / "out" / "glass" / "index.html"

PHONE_HTML = """<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;background:transparent}
  .wrap{display:inline-block;padding:18px 22px 30px}
  .phone{position:relative;width:200px;padding:7px;border-radius:34px;background:#141413;
    box-shadow:0 18px 30px -12px rgba(20,20,19,.45),0 2px 6px rgba(20,20,19,.2),inset 0 0 0 1.5px #3a3941}
  .phone img{display:block;width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:27px}
  .island{position:absolute;top:15px;left:50%;width:54px;height:15px;margin-left:-27px;border-radius:10px;background:#0b0b0c}
</style>
<div class="wrap"><div class="phone"><img src="{src}"><div class="island"></div></div></div>"""


def grab_frame(reel: str, second: float, dst: Path) -> None:
    src = ROOT / "finals" / f"{reel}.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(second), "-i", str(src), "-frames:v", "1", str(dst)],
        check=True,
    )


def grab_glass(page, dst: Path) -> None:
    page.set_viewport_size({"width": 1480, "height": 1900})
    page.goto(GLASS_BOARD.as_uri())
    page.wait_for_timeout(2500)  # let the background clip and displacement maps settle
    frame = page.locator(".frame").first
    frame.screenshot(path=str(dst))


def mockup(page, frame: Path, dst: Path) -> None:
    html = Path(tempfile.mkdtemp()) / "phone.html"
    html.write_text(PHONE_HTML.replace("{src}", frame.as_uri()))
    page.set_viewport_size({"width": 400, "height": 600})
    page.goto(html.as_uri())
    page.wait_for_timeout(200)
    png = dst.with_suffix(".png")
    page.locator(".wrap").screenshot(path=str(png), omit_background=True)
    Image.open(png).save(dst, "WEBP", quality=86, method=6)
    png.unlink()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp())
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        board = browser.new_page(device_scale_factor=2.4)
        glass = tmp / "liquid-glass.png"
        grab_glass(board, glass)
        page = browser.new_page(device_scale_factor=2)
        sources = {"liquid-glass": glass}
        for style, (reel, second) in FRAMES.items():
            sources[style] = tmp / f"{style}.png"
            grab_frame(reel, second, sources[style])
        for style, frame in sources.items():
            dst = OUT / f"{style}.webp"
            mockup(page, frame, dst)
            print(f"{dst.relative_to(ROOT)}  {dst.stat().st_size // 1024} KB")
        browser.close()


if __name__ == "__main__":
    main()
