"""Static risograph grain overlay for the 1080x1350 canvas -> public/grain.png.

Subtle on purpose: judge it at 100% size (a downscaled board hides grain that is loud at full size).
Usage: python3 scripts/grain.py
"""
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

rng = np.random.default_rng(7)
H, W = 1350, 1080
n = gaussian_filter(rng.standard_normal((H, W)), 0.6)
n = (n - n.mean()) / n.std()
img = np.zeros((H, W, 4), np.uint8)
img[n > 1.6] = [25, 36, 37, int(255 * 0.24)]     # ink specks, ~5%
img[n < -1.65] = [246, 246, 232, int(255 * 0.18)]  # paper specks, ~5%
Image.fromarray(img, "RGBA").save("public/grain.png")
