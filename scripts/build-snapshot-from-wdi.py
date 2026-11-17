#!/usr/bin/env python3
"""Build the committed local data record (data/wb/*.json) from the official
World Bank WDI bulk download (WDI_CSV.zip) — used because api.worldbank.org
rate-limits/WAF-blocks some networks. Same output format as
scripts/fetch-data.mjs (the API-based refresher).

Usage:  python3 scripts/build-snapshot-from-wdi.py /path/to/WDI_CSV.zip
"""
import csv, io, json, pathlib, sys, zipfile, datetime, hashlib

INDICATORS = {  # dataset id -> World Bank indicator code (keep in sync with app.js DATASETS)
    "population": "SP.POP.TOTL", "density": "EN.POP.DNST", "birthRate": "SP.DYN.CBRT.IN",
    "lifeExpect": "SP.DYN.LE00.IN", "gdp": "NY.GDP.MKTP.CD", "gdpCap": "NY.GDP.PCAP.CD",
    "gdpGrowth": "NY.GDP.MKTP.KD.ZG", "unemployment": "SL.UEM.TOTL.ZS", "literacy": "SE.ADT.LITR.ZS",
    "internet": "IT.NET.USER.ZS", "urban": "SP.URB.TOTL.IN.ZS", "forest": "AG.LND.FRST.ZS",
    "renewable": "EG.FEC.RNEW.ZS", "co2": "EN.GHG.CO2.PC.CE.AR5", "rainfall": "AG.LND.PRCP.MM",
    "popGrowth": "SP.POP.GROW", "fertility": "SP.DYN.TFRT.IN",
    "electricity": "EG.ELC.ACCS.ZS", "mobiles": "IT.CEL.SETS.P2",
    "childMort": "SH.DYN.MORT", "elderly": "SP.POP.65UP.TO.ZS",
    "undernourish": "SN.ITK.DEFC.ZS", "gini": "SI.POV.GINI",
    "military": "MS.MIL.XPND.GD.ZS", "tourism": "ST.INT.ARVL",
    "protected": "ER.LND.PTLD.ZS", "eduSpend": "SE.XPD.TOTL.GD.ZS",
    "rdSpend": "GB.XPD.RSDV.GD.ZS", "ageDep": "SP.POP.DPND",
    "broadband": "IT.NET.BBND.P2", "foodProd": "AG.PRD.FOOD.XD",
    "trade": "NE.TRD.GNFS.ZS", "maternal": "SH.STA.MMRT",
    "femaleLabor": "SL.TLF.CACT.FE.ZS",
}
root = pathlib.Path(__file__).resolve().parent.parent
outdir = root / "data/wb"; outdir.mkdir(parents=True, exist_ok=True)
z = zipfile.ZipFile(sys.argv[1] if len(sys.argv) > 1 else "/tmp/WDI_CSV.zip")

with z.open("WDICountry.csv") as f:
    countries = list(csv.DictReader(io.TextIOWrapper(f, encoding="utf-8-sig")))
real = {r["Country Code"] for r in countries if r["Region"].strip()}  # aggregates have no Region
print(f"{len(real)} real economies (aggregates excluded)")

by_code = {v: k for k, v in INDICATORS.items()}
data = {k: {} for k in INDICATORS}
with z.open("WDICSV.csv") as f:
    reader = csv.reader(io.TextIOWrapper(f, encoding="utf-8-sig"))
    header = next(reader); years = header[4:]
    for row in reader:
        ds = by_code.get(row[3])
        if not ds or row[1] not in real:
            continue
        vals = {y: round(float(v), 4) for y, v in zip(years, row[4:]) if v.strip()}
        if vals: data[ds][row[1]] = vals

fetched = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
manifest = {"source": "World Bank — World Development Indicators (bulk WDI_CSV.zip)", "fetchedAt": fetched, "datasets": {}}
for ds, code in INDICATORS.items():
    years_sorted = sorted({y for v in data[ds].values() for y in v})
    payload = {"id": ds, "code": code, "source": "World Bank WDI", "fetchedAt": fetched,
               "years": years_sorted, "countries": data[ds]}
    text = json.dumps(payload, separators=(",", ":"))
    (outdir / f"{ds}.json").write_text(text)
    latest = years_sorted[-1] if years_sorted else None
    n_latest = sum(1 for v in data[ds].values() if latest in v) if latest else 0
    manifest["datasets"][ds] = {"code": code, "countries": len(data[ds]), "years": [years_sorted[0], latest] if years_sorted else None,
                                "countriesLatestYear": n_latest, "sha256": hashlib.sha256(text.encode()).hexdigest()[:16],
                                "argentina": data[ds].get("ARG", {}).get(latest), "australia": data[ds].get("AUS", {}).get(latest)}
    print(f"{ds:14s} {code:18s} countries={len(data[ds]):3d} years={years_sorted[0] if years_sorted else '-'}..{latest} latest_n={n_latest} ARG={manifest['datasets'][ds]['argentina']} AUS={manifest['datasets'][ds]['australia']}")
(outdir / "manifest.json").write_text(json.dumps(manifest, indent=1))
print("Wrote", outdir)
