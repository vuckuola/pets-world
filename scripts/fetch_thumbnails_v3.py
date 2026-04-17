#!/usr/bin/env python3
"""Fetch Wikipedia thumbnails using REST API (page/summary) for remaining animals."""
import json, urllib.request, time, sys

DATA = '/home/adm-bot/pets-world/src/data/animals.json'
DELAY = 0.35

def fetch_thumb(name):
    """Try REST API summary endpoint for thumbnail."""
    encoded = urllib.request.quote(name.replace(' ', '_'))
    url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PetsWorldBot/1.0 (educational; contact@pets-world.dev)', 'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read().decode('utf-8')
            # Parse thumbnail from raw text since it's a custom format
            # Look for source: in the thumbnail/originalimage block
            import re
            # Try thumbnail first
            m = re.search(r'thumbnail:\s*\{[^}]*source:\s*"(https?://[^"]+)"', raw)
            if m:
                return m.group(1)
            m = re.search(r'originalimage:\s*\{[^}]*source:\s*"(https?://[^"]+)"', raw)
            if m:
                return m.group(1)
    except Exception as e:
        pass
    return None

def main():
    with open(DATA) as f:
        animals = json.load(f)
    
    found = 0
    for i, a in enumerate(animals):
        if a.get('images') and a['images'] and a['images'][0].get('url'):
            continue
        
        # Try common name, then scientific name
        thumb = fetch_thumb(a['commonName'])
        if not thumb:
            thumb = fetch_thumb(a['scientificName'])
        
        if thumb:
            a['images'] = [{'url': thumb, 'alt': a['commonName'], 'caption': ''}]
            found += 1
            print(f"[{i+1}] {a['commonName']}: OK")
        else:
            print(f"[{i+1}] {a['commonName']}: NO IMAGE")
        
        time.sleep(DELAY)
    
    with open(DATA, 'w') as f:
        json.dump(animals, f, ensure_ascii=False, indent=2)
    
    total = sum(1 for a in animals if a.get('images') and a['images'] and a['images'][0].get('url'))
    print(f"\nNew found: {found}, Total with images: {total}/{len(animals)}")

if __name__ == '__main__':
    main()
