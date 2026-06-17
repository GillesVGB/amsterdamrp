from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "outputs" / "assets" / "banner-amsterdam-roleplay.webp"
TARGET = ROOT / "outputs" / "assets" / "banner-amsterdam-clean.webp"


image = Image.open(SOURCE).convert("RGB")

# Build a clean wide scene from the clear sides of the banner. This avoids the
# centered logo and the bottom wordmark entirely instead of leaving a ghost mark.
canvas = Image.new("RGB", (1600, 900), "#e9f6fb")
left = image.crop((0, 0, 342, 410)).resize((920, 900), Image.Resampling.LANCZOS)
right = image.crop((636, 0, 960, 410)).resize((920, 900), Image.Resampling.LANCZOS)

canvas.paste(left, (0, 0))
canvas.paste(right, (680, 0))

overlap_width = 240
overlap_left = left.crop((680, 0, 920, 900))
overlap_right = right.crop((0, 0, overlap_width, 900))
mask = Image.linear_gradient("L").rotate(90, expand=True).resize((overlap_width, 900))
canvas.paste(Image.composite(overlap_right, overlap_left, mask), (680, 0))

clean = ImageEnhance.Color(canvas).enhance(1.08)
clean = ImageEnhance.Contrast(clean).enhance(0.95)
clean = clean.filter(ImageFilter.GaussianBlur(0.18))

TARGET.parent.mkdir(parents=True, exist_ok=True)
clean.save(TARGET, "WEBP", quality=88, method=6)
print(f"Saved {TARGET}")
