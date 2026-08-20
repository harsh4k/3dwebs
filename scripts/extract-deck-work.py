"""Pull work screenshots from the credentials deck into public/work.

Source: creds/Credentials_CoffeeDigital-2025.pptx, slides 5–32.
The pptx stays gitignored; only compressed WebP derivatives are written.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
import zipfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PPTX = ROOT / "creds" / "Credentials_CoffeeDigital-2025.pptx"
OUT = ROOT / "public" / "work"

# Largest image on each featured work slide, excluding the logo lockup.
PROJECTS = [
    ("abbott-smartpack", "image32.jpg"),
    ("making-india-heart-strong", "image39.jpg"),
    ("synergycom-usa", "image40.jpg"),
    ("enrituals", "image42.jpg"),
    ("pronto-insurance", "image43.jpg"),
    ("uncle-sams-kitchen", "image44.jpg"),
    ("electrotherm-corporate", "image48.jpg"),
    ("motorola", "image52.jpg"),
    ("lodha-palava", "image55.jpg"),
    ("fevicol-design-ideas", "image56.jpg"),
    ("indiabulls-foundation", "image63.jpg"),
]


def save_webp(im: Image.Image, dest: Path, max_w: int = 1920, budget: int = 200_000) -> tuple[int, int, int]:
    im = im.convert("RGB")
    im.thumbnail((max_w, 1920), Image.Resampling.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    quality = 84
    im.save(dest, "WEBP", quality=quality, method=6)
    size = dest.stat().st_size
    while size > budget and quality > 42:
        quality -= 6
        im.save(dest, "WEBP", quality=quality, method=6)
        size = dest.stat().st_size
    width, height = im.size
    print(f"{dest.name:40} {width}x{height} {size:7d} q={quality}")
    return width, height, size


def main() -> None:
    archive = zipfile.ZipFile(PPTX)
    for slug, media in PROJECTS:
        image = Image.open(BytesIO(archive.read(f"ppt/media/{media}")))
        dest = OUT / slug / f"{slug}-deck.webp"
        save_webp(image, dest)


if __name__ == "__main__":
    main()
