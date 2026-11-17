#!/usr/bin/env python3
"""Build data/earthquakes.json — committed snapshot of M6.0+ earthquakes
from the USGS ANSS Comprehensive Catalog (FDSN API), 2000-01-01 → present.

The site renders dots from this file first, then background-refreshes from
USGS for anything newer (same stale-while-revalidate pattern as the WB data).

Run:  python3 scripts/build-earthquakes.py
"""
import datetime, json, pathlib, urllib.parse, urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://earthquake.usgs.gov/fdsnws/event/1/query"

def get(params):
    url = BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "MapsMania-DataSync/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

events, offset = [], 1
while True:
    page = get({"format": "geojson", "starttime": "2000-01-01",
                "minmagnitude": 6, "orderby": "time", "limit": 2000,
                "offset": offset})
    feats = page.get("features") or []
    if not feats:
        break
    for f in feats:
        p, g = f["properties"], f["geometry"]
        if not g or p.get("mag") is None:
            continue
        lon, lat = g["coordinates"][:2]
        depth = g["coordinates"][2] if len(g["coordinates"]) > 2 else None
        events.append({"id": f["id"], "t": p["time"],
                       "m": round(p["mag"], 1), "lon": round(lon, 3),
                       "lat": round(lat, 3),
                       "d": round(depth, 1) if depth is not None else None,
                       "p": (p.get("place") or "Unknown location")[:120]})
    offset += len(feats)
    print(f"  …{len(events)} events")
    if len(feats) < 2000:
        break

events.sort(key=lambda e: e["t"])
payload = {"source": "USGS Earthquake Catalog (ANSS ComCat), M6.0+",
           "fetchedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
           "minMagnitude": 6.0, "since": "2000-01-01",
           "count": len(events), "events": events}
out = root / "data/earthquakes.json"
out.write_text(json.dumps(payload, separators=(",", ":")))
big = max(events, key=lambda e: e["m"])
print(f"Wrote {out} ({out.stat().st_size/1024:.0f} KiB, {len(events)} events)")
print(f"Largest: M{big['m']} — {big['p']} ({datetime.datetime.fromtimestamp(big['t']/1000, datetime.timezone.utc).date()})")
