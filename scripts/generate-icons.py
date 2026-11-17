"""Generate Türkçe Akademi PWA icons (crimson + white crescent & star).

Usage: python scripts/generate-icons.py
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

CRIMSON = (196, 18, 48, 255)
DEEP = (128, 8, 30, 255)
WHITE = (255, 251, 246, 255)


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size * 4, size * 4), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=radius * 4, fill=255)
    return mask.resize((size, size), Image.LANCZOS)


def draw_emblem(canvas: Image.Image, scale: float = 1.0, centered: bool = True) -> None:
    """Draw crescent + star on a transparent layer sized to canvas."""
    size = canvas.size[0]
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    cx = cy = size / 2
    # crescent geometry (Turkish flag inspired)
    r_outer = size * 0.255 * scale
    r_inner = r_outer * 0.80
    offset = r_outer * 0.38

    d.ellipse(
        (cx - r_outer + offset, cy - r_outer, cx + r_outer + offset, cy + r_outer),
        fill=WHITE,
    )
    # punch the inner circle using a red disc on a mask
    mask = Image.new("L", canvas.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse(
        (cx - r_outer + offset, cy - r_outer, cx + r_outer + offset, cy + r_outer),
        fill=255,
    )
    md.ellipse(
        (
            cx - r_inner + offset + r_outer * 0.26,
            cy - r_inner,
            cx + r_inner + offset + r_outer * 0.26,
            cy + r_inner,
        ),
        fill=0,
    )
    # star
    star_cx = cx + r_outer * 1.05
    star_cy = cy
    r_star = r_outer * 0.44
    points = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rr = r_star if i % 2 == 0 else r_star * 0.382
        points.append((star_cx + rr * math.cos(ang), star_cy + rr * math.sin(ang)))
    star_mask = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(star_mask).polygon(points, fill=255)

    mask = Image.composite(star_mask, mask, star_mask)
    layer.putalpha(mask)

    # soft shadow for depth
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 70), (0, 0), mask)
    shadow = shadow.filter(ImageFilter.GaussianBlur(size * 0.012))
    canvas.alpha_composite(shadow, (0, int(size * 0.008)))
    canvas.alpha_composite(layer)


def make_icon(size: int, rounded: bool, padding: float = 0.0) -> Image.Image:
    ss = 4  # supersample
    big = size * ss
    canvas = Image.new("RGBA", (big, big), (0, 0, 0, 0))

    # background gradient: deep crimson -> crimson, diagonal
    grad = Image.new("RGBA", (big, big))
    gd = ImageDraw.Draw(grad)
    for y in range(big):
        t = y / max(1, big - 1)
        color = tuple(int(DEEP[i] + (CRIMSON[i] - DEEP[i]) * t) for i in range(4))
        gd.line([(0, y), (big, y)], fill=color)
    # subtle radial highlight
    hi = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(hi).ellipse(
        (big * 0.05, -big * 0.25, big * 0.95, big * 0.7),
        fill=(255, 255, 255, 26),
    )
    grad.alpha_composite(hi)
    canvas.alpha_composite(grad)

    draw_emblem(canvas, scale=1.0 - padding * 2)

    if rounded:
        canvas.putalpha(rounded_mask(big, int(big * 0.22)))

    return canvas.resize((size, size), Image.LANCZOS)


def main() -> None:
    make_icon(192, rounded=True).save(OUT / "icon-192.png", optimize=True)
    make_icon(512, rounded=True).save(OUT / "icon-512.png", optimize=True)
    # maskable: full-bleed square with emblem inside the safe zone
    make_icon(512, rounded=False, padding=0.10).save(OUT / "maskable-512.png", optimize=True)
    make_icon(180, rounded=False, padding=0.04).save(OUT / "apple-touch-icon.png", optimize=True)
    make_icon(32, rounded=False, padding=0.02).save(ROOT / "public" / "favicon-32.png", optimize=True)
    print("icons written to", OUT)


if __name__ == "__main__":
    main()
