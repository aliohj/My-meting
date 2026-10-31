"""Build a corner logo asset (white logo + soft shadow) sized for the video.

Usage: python3 make_logo_bug.py <logo.png> <out.png> <logo_width_px>
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out, target_w = sys.argv[1], sys.argv[2], int(sys.argv[3])

im = Image.open(src).convert("RGBA")
a = np.array(im)[..., 3]
ys, xs = np.where(a > 8)
logo = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

# Downscale using alpha only (logo is pure white) -> clean edges, no halos.
alpha = logo.getchannel("A")
scale = target_w / logo.width
target_h = round(logo.height * scale)
alpha = alpha.resize((target_w, target_h), Image.LANCZOS, reducing_gap=3.0)

k = target_w / 200.0  # effects tuned at 200px logo width; scale with size
pad = round(24 * k)
W, H = target_w + pad * 2, target_h + pad * 2
mask = Image.new("L", (W, H), 0)
mask.paste(alpha, (pad, pad))

# Two-layer shadow: tight contact shadow + wide soft ambient glow
def layer(radius, opacity, dy):
    m = Image.new("L", (W, H), 0)
    m.paste(alpha, (pad, pad + dy))
    m = m.filter(ImageFilter.GaussianBlur(radius))
    return np.array(m, dtype=np.float32) / 255.0 * opacity

sh = 1 - (1 - layer(1.6 * k, 0.55, round(1 * k))) * (1 - layer(9 * k, 0.38, round(2 * k)))
fg = np.array(mask, dtype=np.float32) / 255.0 * 0.96

# Composite white fg over black shadow (straight alpha)
out_a = fg + sh * (1 - fg)
rgb = np.where(out_a > 0, (fg * 250.0) / np.maximum(out_a, 1e-6), 0)
res = np.dstack([rgb, rgb, rgb, out_a * 255.0]).clip(0, 255).astype(np.uint8)
Image.fromarray(res, "RGBA").save(out)
print(f"{out}: {W}x{H} (logo {target_w}x{target_h}, pad {pad})")
