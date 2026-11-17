#!/usr/bin/env python3
"""Build data/points.js — dot-layer datasets: iconic volcanic eruptions,
megacities, busiest airports, famous meteorites. Hand-authored, approximate
coords are fine at world-map scale. Format per point:
{id, n (name), c (ISO), y (year, null = snapshot), lat, lon, v (size/rank value), v2 (extra)}
Run:  python3 scripts/build-points.py
"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent

# name, ISO, year, VEI, lat, lon
ERUPTIONS = [
 ("Tambora", "IDN", 1815, 7, -8.25, 118.0), ("Krakatau", "IDN", 1883, 6, -6.1, 105.42),
 ("Novarupta", "USA", 1912, 6, 58.27, -155.16), ("Santa María", "GTM", 1902, 6, 14.76, -91.55),
 ("Pelée", "FRA", 1902, 4, 14.82, -61.17), ("Colima", "MEX", 1913, 5, 19.51, -103.62),
 ("Quizapu", "CHL", 1932, 5, -35.65, -70.75), ("Paricutín", "MEX", 1943, 4, 19.49, -102.25),
 ("Hekla 1947", "ISL", 1947, 4, 63.98, -19.7), ("Bezymianny", "RUS", 1956, 5, 55.98, 160.59),
 ("Agung", "IDN", 1963, 5, -8.34, 115.51), ("Taal 1965", "PHL", 1965, 4, 14.0, 120.99),
 ("Mount St. Helens", "USA", 1980, 5, 46.2, -122.18), ("El Chichón", "MEX", 1982, 5, 17.36, -93.23),
 ("Nevado del Ruiz", "COL", 1985, 3, 4.89, -75.32), ("Heimaey", "ISL", 1973, 3, 63.63, -20.62),
 ("Pinatubo", "PHL", 1991, 6, 15.13, 120.35), ("Cerro Hudson", "CHL", 1991, 5, -45.9, -72.97),
 ("Rabaul", "PNG", 1994, 4, -4.27, 152.2), ("Gjálp", "ISL", 1996, 4, 64.63, -17.56),
 ("Kasatochi", "USA", 2008, 4, 52.18, -175.51), ("Chaitén", "CHL", 2008, 4, -42.83, -72.65),
 ("Sarychev", "RUS", 2009, 4, 48.09, 153.2), ("Eyjafjallajökull", "ISL", 2010, 4, 63.63, -19.62),
 ("Merapi 2010", "IDN", 2010, 4, -7.54, 110.44), ("Grímsvötn", "ISL", 2011, 4, 64.42, -17.33),
 ("Nabro", "ERI", 2011, 4, 13.37, 41.7), ("Puyehue", "CHL", 2011, 5, -40.59, -72.12),
 ("Kelud", "IDN", 2014, 4, -7.93, 112.31), ("Calbuco", "CHL", 2015, 4, -41.33, -72.61),
 ("Fuego 2018", "GTM", 2018, 4, 14.47, -90.88), ("Anak Krakatau", "IDN", 2018, 3, -6.1, 105.42),
 ("Cumbre Vieja", "ESP", 2021, 3, 28.57, -17.84), ("Taal 2020", "PHL", 2020, 4, 14.0, 120.99),
 ("La Soufrière", "VCT", 2021, 4, 13.33, -61.18), ("Hunga Tonga", "TON", 2022, 5, -20.54, -175.39),
 ("Ruang", "IDN", 2024, 4, 2.3, 125.37),
]

# name, ISO, metro pop (millions, approx), lat, lon
CITIES = [
 ("Tokyo", "JPN", 37.0, 35.68, 139.69), ("Delhi", "IND", 32.0, 28.61, 77.21),
 ("Shanghai", "CHN", 28.5, 31.23, 121.47), ("Dhaka", "BGD", 22.5, 23.81, 90.41),
 ("São Paulo", "BRA", 22.0, -23.55, -46.63), ("Mexico City", "MEX", 22.0, 19.43, -99.13),
 ("Cairo", "EGY", 21.0, 30.04, 31.24), ("Beijing", "CHN", 21.5, 39.9, 116.4),
 ("Mumbai", "IND", 20.5, 19.08, 72.88), ("Osaka", "JPN", 19.0, 34.69, 135.5),
 ("Karachi", "PAK", 17.5, 24.86, 67.0), ("Kinshasa", "COD", 16.0, -4.32, 15.31),
 ("Lagos", "NGA", 15.5, 6.52, 3.38), ("Buenos Aires", "ARG", 15.0, -34.6, -58.38),
 ("Kolkata", "IND", 15.0, 22.57, 88.36), ("Istanbul", "TUR", 15.0, 41.0, 28.98),
 ("Manila", "PHL", 14.5, 14.6, 120.98), ("Guangzhou", "CHN", 14.0, 23.13, 113.26),
 ("Rio de Janeiro", "BRA", 13.5, -22.91, -43.17), ("Shenzhen", "CHN", 13.0, 22.54, 114.06),
 ("Lahore", "PAK", 13.0, 31.55, 74.35), ("Bengaluru", "IND", 13.0, 12.97, 77.59),
 ("Paris", "FRA", 11.0, 48.85, 2.35), ("Bogotá", "COL", 11.0, 4.71, -74.07),
 ("Chennai", "IND", 11.0, 13.08, 80.27), ("Jakarta", "IDN", 11.0, -6.21, 106.85),
 ("Bangkok", "THA", 10.5, 13.76, 100.5), ("Lima", "PER", 10.5, -12.05, -77.04),
 ("Seoul", "KOR", 10.0, 37.57, 126.98), ("Hyderabad", "IND", 10.0, 17.39, 78.49),
 ("London", "GBR", 9.5, 51.5, -0.13), ("Tehran", "IRN", 9.0, 35.69, 51.39),
 ("New York", "USA", 8.5, 40.71, -74.0), ("Chicago", "USA", 8.8, 41.88, -87.63),
 ("Los Angeles", "USA", 12.5, 34.05, -118.24), ("Moscow", "RUS", 12.5, 55.76, 37.62),
 ("Ahmedabad", "IND", 8.5, 23.03, 72.59), ("Hong Kong", "CHN", 7.5, 22.32, 114.17),
 ("Baghdad", "IRQ", 7.5, 33.31, 44.36), ("Riyadh", "SAU", 7.5, 24.71, 46.68),
 ("Singapore", "SGP", 6.0, 1.35, 103.82), ("Madrid", "ESP", 6.5, 40.42, -3.7),
 ("Toronto", "CAN", 6.5, 43.65, -79.38),
]

# airport, ISO, 2023 pax (millions, approx), lat, lon
AIRPORTS = [
 ("Atlanta ATL", "USA", 104.7, 33.64, -84.43), ("Dubai DXB", "ARE", 87.0, 25.25, 55.36),
 ("Dallas/Fort Worth", "USA", 81.8, 32.9, -97.04), ("London Heathrow", "GBR", 79.0, 51.47, -0.45),
 ("Tokyo Haneda", "JPN", 78.0, 35.55, 139.78), ("Denver", "USA", 77.8, 39.86, -104.67),
 ("Istanbul IST", "TUR", 76.0, 41.26, 28.74), ("Chicago O'Hare", "USA", 73.9, 41.97, -87.91),
 ("Los Angeles LAX", "USA", 75.0, 33.94, -118.41), ("New York JFK", "USA", 62.5, 40.64, -73.78),
 ("Singapore Changi", "SGP", 59.0, 1.36, 103.99), ("Paris CDG", "FRA", 67.0, 49.01, 2.55),
 ("Amsterdam", "NLD", 61.0, 52.31, 4.76), ("Frankfurt", "DEU", 59.0, 50.03, 8.56),
 ("Guangzhou CAN", "CHN", 65.0, 23.39, 113.3), ("Delhi DEL", "IND", 72.0, 28.57, 77.1),
 ("Mumbai BOM", "IND", 52.0, 19.09, 72.87), ("Seoul Incheon", "KOR", 68.0, 37.46, 126.44),
 ("Beijing Capital", "CHN", 53.0, 40.08, 116.58), ("Shanghai Pudong", "CHN", 54.0, 31.14, 121.81),
 ("Shenzhen", "CHN", 53.0, 22.63, 113.81), ("Bangkok BKK", "THA", 68.0, 13.69, 100.75),
 ("Hong Kong HKG", "CHN", 40.0, 22.31, 113.91), ("Sydney", "AUS", 38.0, -33.95, 151.18),
 ("São Paulo GRU", "BRA", 41.0, -23.44, -46.47), ("Mexico City MEX", "MEX", 48.0, 19.44, -99.07),
 ("Madrid Barajas", "ESP", 62.0, 40.47, -3.57), ("Barcelona", "ESP", 50.0, 41.3, 2.08),
 ("Rome Fiumicino", "ITA", 40.0, 41.8, 12.25), ("Toronto Pearson", "CAN", 45.0, 43.68, -79.63),
 ("Doha DOH", "QAT", 45.0, 25.27, 51.61), ("Jeddah", "SAU", 43.0, 21.68, 39.16),
 ("Riyadh RUH", "SAU", 35.0, 24.96, 46.7), ("Kuala Lumpur", "MYS", 47.0, 2.75, 101.71),
 ("Manila MNL", "PHL", 45.0, 13.09, 121.02), ("Taipei TPE", "TWN", 35.0, 25.08, 121.23),
 ("Jakarta CGK", "IDN", 60.0, -6.13, 106.66), ("San Francisco", "USA", 51.0, 37.62, -122.38),
 ("Las Vegas", "USA", 57.0, 36.08, -115.15), ("Miami", "USA", 52.0, 25.79, -80.29),
]

# name, ISO, year, mass kg (null = unknown/airburst), lat, lon
METEORITES = [
 ("Hoba", "NAM", 1920, 60000, -19.58, 17.93), ("Murchison", "AUS", 1969, 100, -36.62, 138.59),
 ("Allende", "MEX", 1969, 2000, 26.97, -105.32), ("Chelyabinsk", "RUS", 2013, 12000, 55.15, 61.41),
 ("Sikhote-Alin", "RUS", 1947, 23000, 46.16, 134.65), ("Peekskill", "USA", 1992, 12, 41.28, -73.92),
 ("Ensisheim", "FRA", 1492, 127, 47.87, 7.35), ("L'Aigle", "FRA", 1803, 37, 48.76, 0.63),
 ("Pultusk", "POL", 1868, 9000, 52.78, 21.27), ("Knyahinya", "UKR", 1866, 500, 48.9, 22.4),
 ("Barwell", "GBR", 1965, 44, 52.6, -1.25), ("Gao-Guenie", "BFA", 1960, 1000, 11.65, -2.18),
 ("Homestead", "USA", 1875, 230, 41.72, -91.85), ("Richardton", "USA", 1918, 90, 46.89, -102.31),
 ("Mbale", "UGA", 1992, 110, 0.45, 34.18), ("Millbillillie", "AUS", 1960, 25, -26.45, 120.32),
 ("Tunguska", "RUS", 1908, None, 60.9, 101.9), ("Willamette", "USA", 1902, 15400, 45.37, -122.59),
 ("Ahnighito", "GRL", 1894, 31000, 76.53, -67.82), ("Bacubirito", "MEX", 1892, 22000, 26.2, -107.83),
 ("Mundrabilla", "AUS", 1911, 22000, -30.77, 127.55), ("Toluca", "MEX", 1776, 2000, 19.6, -99.9),
 ("Krasnojarsk", "RUS", 1749, 700, 54.9, 91.8), ("Wold Cottage", "GBR", 1795, 25, 54.14, -0.51),
 ("Dhurmsala", "IND", 1860, 11, 32.27, 76.32), ("St Michel", "FIN", 1910, 17, 61.7, 27.2),
 ("Juvinas", "FRA", 1821, 91, 44.55, 4.3),
]

def pack(rows, shape):
    # shape: list of field names in row order, e.g. ["n","c","y","v","lat","lon"]
    out = []
    for i, r in enumerate(rows):
        pt = {"id": f"{r[0]}-{i}"}
        for field, val in zip(shape, r):
            pt[field] = val
        pt.setdefault("y", None)
        pt.setdefault("v", None)
        pt.setdefault("v2", None)
        out.append(pt)
    return out

POINT_DATA = {
    "eruptions": pack(ERUPTIONS, ["n", "c", "y", "v", "lat", "lon"]),
    "cities": pack(CITIES, ["n", "c", "v", "lat", "lon"]),
    "airports": pack(AIRPORTS, ["n", "c", "v", "lat", "lon"]),
    "meteorites": pack(METEORITES, ["n", "c", "y", "v", "lat", "lon"]),
}

# cities/airports are snapshots (single year) so the timeline hides
for pt in POINT_DATA["cities"] + POINT_DATA["airports"]:
    pt["y"] = 2024

out = root / "data/points.js"
body = "// GENERATED by scripts/build-points.py — do not hand-edit. Approx coords.\n"
body += "const POINT_DATA = " + json.dumps(POINT_DATA, separators=(",", ":")) + ";\n"
out.write_text(body)
for k, v in POINT_DATA.items():
    ys = sorted({p["y"] for p in v if p["y"]})
    print(f"{k:12s} points={len(v):3d} years={ys[0] if ys else '-'}..{ys[-1] if ys else '-'}")
print(f"Wrote {out} ({out.stat().st_size/1024:.0f} KiB)")
