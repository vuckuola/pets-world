#!/usr/bin/env python3
"""Try scientific name as fallback for animals without images."""
import json, urllib.request, time, sys

DATA = '/home/adm-bot/pets-world/src/data/animals.json'
DELAY = 0.3

def fetch_thumb(name):
    url = f'https://en.wikipedia.org/w/api.php?action=query&titles={urllib.request.quote(name)}&prop=pageimages&format=json&pithumbsize=400'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PetsWorldBot/1.0 (educational; contact@pets-world.dev)'})
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
        if a.get('images') and a['images'] and a['images'][0].get('url'):
            continue  # already has image
        
        # Try common name first, then scientific name
        thumb = fetch_thumb(a['commonName'])
        if not thumb:
            thumb = fetch_thumb(a['scientificName'])
        
        if thumb:
            a['images'] = [{'url': thumb, 'alt': a['commonName'], 'caption': ''}]
            found += 1
            src = 'common' if fetch_thumb(a['commonName']) else 'scientific'
            print(f"[{i+1}] {a['commonName']}: OK (via {a['scientificName'][:20]}...)")
        else:
            print(f"[{i+1}] {a['commonName']}: STILL NO IMAGE")
        
        time.sleep(DELAY)
    
    with open(DATA, 'w') as f:
        json.dump(animals, f, ensure_ascii=False, indent=2)
    
    total = sum(1 for a in animals if a.get('images') and a['images'] and a['images'][0].get('url'))
    print(f"\nNew found: {found}, Total with images: {total}/{len(animals)}")

if __name__ == '__main__':
    main()
