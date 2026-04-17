#!/usr/bin/env python3
"""Fetch Wikipedia thumbnails for all animals and hardcode into images field."""
import json, urllib.request, time, sys

DATA = '/home/adm-bot/pets-world/src/data/animals.json'
DELAY = 0.3

def fetch_thumb(name):
    url = f'https://en.wikipedia.org/w/api.php?action=query&titles={urllib.request.quote(name)}&prop=pageimages&format=json&pithumbsize=400'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PetsWorldBot/1.0 (educational project; contact@pets-world.dev)'})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        pages = data.get('query', {}).get('pages', {})
        for pid, page in pages.items():
            if pid == '-1': continue
            thumb = page.get('thumbnail', {})
            if thumb.get('source'):
                return thumb['source']
    except Exception as e:
        print(f"  ERR {name}: {e}", file=sys.stderr)
    return None

def main():
    with open(DATA) as f:
        animals = json.load(f)
    
    found = 0
    for i, a in enumerate(animals):
        name = a['commonName']
        thumb = fetch_thumb(name)
        if thumb:
            a['images'] = [{'url': thumb, 'alt': name, 'caption': ''}]
            found += 1
            print(f"[{i+1}/{len(animals)}] {name}: OK")
        else:
            print(f"[{i+1}/{len(animals)}] {name}: NO IMAGE")
        if i < len(animals) - 1:
            time.sleep(DELAY)
    
    with open(DATA, 'w') as f:
        json.dump(animals, f, ensure_ascii=False, indent=2)
    
    print(f"\nDone: {found}/{len(animals)} images found")

if __name__ == '__main__':
    main()
