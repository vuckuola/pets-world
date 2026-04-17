#!/usr/bin/env python3
"""Fetch Wikipedia thumbnails for all animals and update animals.json."""

import json
import time
import urllib.request
import urllib.parse
import urllib.error
import sys

ANIMALS_FILE = "src/data/animals.json"
API_BASE = "https://en.wikipedia.org/w/api.php"
DELAY = 0.5  # seconds between requests


def fetch_thumbnail(common_name: str) -> str | None:
    """Fetch thumbnail URL from Wikipedia API for a given common name."""
    params = {
        "action": "query",
        "titles": common_name,
        "prop": "pageimages",
        "format": "json",
        "pithumbsize": 400,
        "redirects": 1,
    }
    url = f"{API_BASE}?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PetsWorldBot/1.0 (educational project)"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
        print(f"  ERROR fetching '{common_name}': {e}", file=sys.stderr)
        return None

    pages = data.get("query", {}).get("pages", {})
    for page_id, page_data in pages.items():
        if page_id == "-1":
            return None  # page not found
        thumb = page_data.get("thumbnail", {})
        return thumb.get("source") if thumb else None
    return None


def main():
    with open(ANIMALS_FILE, "r", encoding="utf-8") as f:
        animals = json.load(f)

    total = len(animals)
    found = 0
    missing = 0

    print(f"Processing {total} animals...")

    for i, animal in enumerate(animals):
        name = animal["commonName"]
        print(f"[{i+1}/{total}] {name}...", end=" ", flush=True)

        thumb_url = fetch_thumbnail(name)

        if thumb_url:
            animal["images"] = [
                {"url": thumb_url, "alt": name, "caption": ""}
            ]
            found += 1
            print(f"OK")
        else:
            # Try scientific name as fallback
            sci_name = animal.get("scientificName", "")
            if sci_name:
                print(f"(trying scientific name)...", end=" ", flush=True)
                thumb_url = fetch_thumbnail(sci_name)
                if thumb_url:
                    animal["images"] = [
                        {"url": thumb_url, "alt": name, "caption": ""}
                    ]
                    found += 1
                    print(f"OK (via scientific name)")
                else:
                    animal["images"] = []
                    missing += 1
                    print(f"NO THUMBNAIL")
            else:
                animal["images"] = []
                missing += 1
                print(f"NO THUMBNAIL")

        time.sleep(DELAY)

    with open(ANIMALS_FILE, "w", encoding="utf-8") as f:
        json.dump(animals, f, indent=2, ensure_ascii=False)
        f.write("\n")  # trailing newline

    print(f"\nDone! {found} with images, {missing} without, {total} total")


if __name__ == "__main__":
    main()
