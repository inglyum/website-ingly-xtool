#!/usr/bin/env python3
"""Import curated REAL photographs for INGLY DESIGN.

No image generation. Fetches only individually reviewed Unsplash free PHOTO
pages; verifies downloaded bytes are raster photos; makes responsive WebP
derivatives. Product photos, prices and INGLY portfolio remain untouched.
Inspired by Medusa's ordered ProductImage + ProductCategory metadata.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageFile

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "img"
DATA = ROOT / "data"
ImageFile.LOAD_TRUNCATED_IMAGES = False

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
SIZES = [(1200, 800, ""), (800, 533, "-800"), (400, 267, "-400")]

def http(url: str) -> bytes:
    last = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=45) as response:
                body = response.read(16_000_001)
                if len(body) > 16_000_000:
                    raise ValueError("Downloaded image exceeds 16 MB limit")
                return body
        except Exception as exc:
            last = exc
            time.sleep(1 + 2 * attempt)
    raise RuntimeError(f"Photo URL unavailable: {url} ({last})")

def load_image(photo_id: str) -> tuple[Image.Image,str]:
    # Pexels direct photographic CDN: tested on GitHub Actions without API keys.
    # Never use Unsplash webpage scraping, which responded HTTP 401.
    photo_id = str(int(photo_id))
    url = (f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"
           "?auto=compress&cs=tinysrgb&w=1800")
    blob = http(url)
    image = Image.open(io.BytesIO(blob))
    image.verify()
    image = Image.open(io.BytesIO(blob)).convert("RGB")
    if min(image.size) < 400 or max(image.size) < 1000:
        raise ValueError(f"Actual source resolution too small: {image.size}")
    if image.width / max(1, image.height) > 6:
        raise ValueError("Extreme banner ratio is unsuitable for material photography")
    return image, url

def main() -> None:
    raw = json.loads((DATA / "real-photo-sources.json").read_text(encoding="utf-8"))
    items = raw["items"]
    if len(items) != 22 or len({x["id"] for x in items}) != len(items):
        raise AssertionError("Expected 22 unique reviewed real-photo entries")

    categories = json.loads((DATA / "categories.json").read_text(encoding="utf-8"))
    materials = json.loads((DATA / "materiali.json").read_text(encoding="utf-8"))
    cat_by_id = {x["id"]: x for x in categories}
    mat_by_id = {x["id"]: x for x in materials["materiali"]}

    results = []
    # First build all asset bytes before mutating any JSON to avoid mixed state.
    for n, item in enumerate(items, 1):
        provenance = item["provenance"]
        if provenance["assetKind"] != "licensed-stock" or provenance["license"] != "Pexels License":
            raise AssertionError("Only reviewed genuine licensed stock photographs may be imported")
        if provenance["notOwnerProduct"] is not True or provenance["notInPortfolio"] is not True:
            raise AssertionError("Stock photos must not be claimed as INGLY customer products")
        if not re.match(r"^https://www\.pexels\.com/photo/\d+/$", provenance["sourceUrl"]):
            raise AssertionError(f"Unreviewed stock provenance for {item['id']}")
        if not str(item["photoId"]).isdigit():
            raise AssertionError(f"Invalid Pexels photo ID for {item['id']}")

        ent_id = item["entityId"]
        obj = (cat_by_id if item["entityType"] == "category" else mat_by_id).get(ent_id)
        if obj is None:
            raise ValueError(f"Unknown original INGLY content id: {item['id']}")
        media, resolved = load_image(item["photoId"])
        image_records = []
        for width, height, suffix in SIZES:
            target = IMG_DIR / (("cat-" if item["entityType"] == "category" else "material-") + ent_id + suffix + ".webp")
            resized = ImageOps.fit(media, (width, height), method=Image.Resampling.LANCZOS, centering=(.5, .5))
            resized.save(target, "WEBP", quality=79 if width < 1200 else 84, method=6)
            name = target.relative_to(ROOT).as_posix()
            image_records.append({"url":name,"width":width,"height":height,
                                  "bytes":target.stat().st_size,
                                  "sha256":hashlib.sha256(target.read_bytes()).hexdigest()})
        results.append((item,obj,resolved,image_records))
        print(f"[{n}/{len(items)}] REAL PHOTOGRAPH imported for {item['id']} "
              f"({media.width}x{media.height})",flush=True)

    for item, obj, resolved, images in results:
        if obj.get("img") and obj.get("img") != images[0]["url"]:
            obj["previousCover"] = obj["img"]
        obj.update({
            "img":images[0]["url"],
            "assetKind":"licensed-stock",
            "isDemo":True,
            "replaceable":True,
            "sourceUrl":item["provenance"]["sourceUrl"],
            "licenseStatus":"Pexels License",
            "altIT":item["altIT"],
            "altEN":item["altEN"],
            "photographer":item["provenance"]["photographer"],
            "imageMeta":{"width":1200,"height":800,"focalPoint":{"x":.5,"y":.5},"objectFit":"cover"},
        })
        item["resolvedImageUrl"] = resolved
        item["media"]["srcset"] = images
        item["media"]["width"] = 1200
        item["media"]["height"] = 800
        item.pop("photoId", None) # do not publish a redundant operational token

    # Save valid, fully-linked content with provenance; no product or portfolio changes.
    (DATA / "categories.json").write_text(json.dumps(categories,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (DATA / "materiali.json").write_text(json.dumps(materials,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (DATA / "real-photo-sources.json").write_text(json.dumps(raw,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"READY: {len(results)} authentic reference photos x {len(SIZES)} sizes = {len(results)*len(SIZES)} WebP",flush=True)

if __name__ == "__main__":
    main()
