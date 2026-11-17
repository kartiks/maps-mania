#!/usr/bin/env python3
"""Replace India's geometry in data/world.geo.json with the official-boundary
outline (Survey-of-India aligned: full J&K incl. PoK/Gilgit-Baltistan, Ladakh
incl. Aksai Chin, Arunachal Pradesh), dissolved from
data/india-states-official.geojson (MIT, AbhinavSwami28/india-official-geojson,
which uses india-in-data/kashmir for J&K/Ladakh).

Two rendering fixes are applied, both verified in a browser:
1. Winding: D3's spherical geoPath fills the *complement* of a polygon whose
   exterior ring is wound the wrong way (the shape floods the whole sphere —
   this is also why the ocean appeared to change colour: Bermuda in the base
   file has a reversed ring and repainted the sphere in its data colour).
   Every exterior ring here is forced to the same winding as the other 179
   countries (negative lon/lat signed area); Bermuda is fixed the same way.
2. Cleaning: neighbouring state polygons in the source don't share exact
   borders, so a naive dissolve leaves hundreds of hairline holes/slivers.
   A small morphological close (buffer out/in) + hole-filling + an area
   threshold yields one clean mainland outline plus real islands.

Requires: shapely  (pip install shapely) — build-time only, not a runtime dep.
Run:  python3 scripts/build-india-world.py
The output is committed, so the website itself needs no Python.
"""
import json, pathlib
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union

root = pathlib.Path(__file__).resolve().parent.parent
world_path = root / "data/world.geo.json"
india_path = root / "data/india-states-official.geojson"

world = json.loads(world_path.read_text())
states = json.loads(india_path.read_text())

union = unary_union([shape(f["geometry"]) for f in states["features"]])
closed = union.buffer(0.04).buffer(-0.04)          # close hairline inter-state gaps
closed = closed.simplify(0.01, preserve_topology=True)
parts = list(closed.geoms) if closed.geom_type == "MultiPolygon" else [closed]
parts = [Polygon(p.exterior) for p in parts if p.area > 0.002]  # fill holes, drop slivers
clean = MultiPolygon(parts)

def signed(ring):
    return sum(ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] for i in range(len(ring) - 1)) / 2

def rewind(geojson_geom):
    """Force exterior rings to negative signed area (D3 spherical winding)."""
    polys = [geojson_geom["coordinates"]] if geojson_geom["type"] == "Polygon" else geojson_geom["coordinates"]
    for poly in polys:
        for i, ring in enumerate(poly):
            s = signed(ring)
            if (i == 0 and s > 0) or (i > 0 and s < 0):
                poly[i] = ring[::-1]
    return geojson_geom

geo = mapping(clean)
def rnd(c):
    if isinstance(c[0], (int, float)):
        return [round(c[0], 3), round(c[1], 3)]
    return [rnd(x) for x in c]
geo = rewind({"type": geo["type"], "coordinates": rnd(geo["coordinates"])})

found = False
for f in world["features"]:
    if f["id"] == "IND":
        f["geometry"] = geo
        f["properties"]["boundary_source"] = "Official India outline (Survey of India aligned), see data/README.md"
        found = True
    if f["id"] == "BMU":  # reversed ring in the base file flooded the sphere/ocean
        f["geometry"] = rewind(f["geometry"])
assert found, "IND feature not found in world.geo.json"

world_path.write_text(json.dumps(world, separators=(",", ":")))
coords = []
def walk(c):
    if isinstance(c[0], (int, float)): coords.append(c)
    else:
        for x in c: walk(x)
walk(geo["coordinates"])
print(f"IND replaced: {len(parts)} polygons. Official bbox lon {min(c[0] for c in coords):.2f}..{max(c[0] for c in coords):.2f} "
      f"lat {min(c[1] for c in coords):.2f}..{max(c[1] for c in coords):.2f} (expect max lat ~37.1, not ~35.5)")
print(f"Wrote {world_path} ({world_path.stat().st_size/1024:.0f} KiB, {len(world['features'])} features)")
