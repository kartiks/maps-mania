#!/usr/bin/env python3
"""Build data/curated-extra.js — generated curated country datasets.

Values are rounded snapshots from the sources cited per dataset (see
data/README.md). "Approximate, for discovery not engineering" — same honesty
bar as the existing curated sets in data.js. Missing country = no data
(hatched grey on the map); we never invent numbers, we just omit.

Run:  python3 scripts/build-curated-extra.py
"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
isos = [f["id"] for f in json.loads((root / "data/world.geo.json").read_text())["features"]]

# ---------------------------------------------------------------- driving side (full coverage: 1 = left-hand traffic)
LEFT = """GBR IRL MLT CYP BWA SWZ KEN LSO MWI MUS MOZ NAM SYC ZAF TZA UGA ZMB
ZWE RWA BGD BTN BRN IND IDN JPN MYS MDV NPL PAK SGP LKA THA TLS AUS FJI KIR
NRU NZL PNG WSM SLB TON TUV VUT ATG BHS BRB DMA GRD GUY JAM KNA LCA VCT SUR
TTO""".split()
driving = {i: (1 if i in LEFT else 0) for i in isos}

# ---------------------------------------------------------------- landlocked (full coverage: 0 coast, 1 landlocked, 2 doubly)
LOCK1 = """AFG AND ARM AUT AZE BLR BTN BOL BWA BFA BDI CAF TCD CZE ETH HUN KAZ
KGZ LAO LSO LUX MKD MWI MLI MDA MNG NPL NER PRY RWA SMR SRB SVK CHE TJK TKM
UGA ZMB ZWE SSD SWZ VAT""".split()
landlocked = {i: 0 for i in isos}
for i in LOCK1:
    if i in landlocked:
        landlocked[i] = 1
landlocked["LIE"] = 2
landlocked["UZB"] = 2

# ---------------------------------------------------------------- time zones incl. territories (full coverage, default 1)
TZ = {"FRA": 12, "RUS": 11, "USA": 11, "GBR": 9, "AUS": 8, "CAN": 6, "DNK": 5,
      "NZL": 5, "BRA": 4, "MEX": 4, "IDN": 3, "KIR": 3, "CHL": 3, "ESP": 2,
      "PRT": 2, "NLD": 2, "ZAF": 2, "COD": 2, "ECU": 2, "MNG": 2, "PNG": 2,
      "FSM": 2, "ATA": 9}
timezones = {i: TZ.get(i, 1) for i in isos}

# ---------------------------------------------------------------- living languages (Ethnologue 2024, rounded)
languages = {"PNG": 840, "IDN": 700, "NGA": 520, "IND": 450, "CHN": 300,
"USA": 300, "AUS": 300, "MEX": 290, "CMR": 280, "BRA": 200, "COD": 200,
"CAN": 200, "PHL": 180, "MYS": 140, "RUS": 130, "SDN": 130, "TCD": 130,
"TZA": 120, "NPL": 120, "VNM": 110, "MMR": 110, "PER": 100, "ETH": 90,
"LAO": 85, "FRA": 80, "IRN": 75, "PAK": 75, "COL": 70, "KEN": 70, "THA": 70,
"CAF": 70, "SLB": 70, "COG": 60, "SSD": 60, "ZAF": 35, "DEU": 25, "GIN": 25,
"GTM": 25, "ECU": 25, "VUT": 110, "GBR": 15, "ESP": 15, "ARG": 15, "DZA": 15,
"CIV": 15, "GHA": 15, "MLI": 15, "SEN": 15, "SLE": 15, "TUR": 35, "ISR": 35,
"KHM": 35, "BOL": 35, "VEN": 40, "AGO": 40, "AFG": 40, "BGD": 40, "GAB": 40,
"ZMB": 40, "LKA": 30, "LBR": 30, "BWA": 30, "NAM": 30, "ITA": 30, "CRI": 10,
"CUB": 5, "DOM": 5, "HTI": 5, "URY": 5, "SAU": 5, "IRQ": 5, "JOR": 5, "LBN": 5,
"SOM": 5, "CPV": 5, "DNK": 5, "IRL": 5, "PRT": 5, "EST": 5, "LVA": 5, "LTU": 5,
"HRV": 5, "SVN": 5, "BIH": 5, "MNE": 5, "MKD": 5, "ALB": 5, "BGR": 5, "HUN": 5,
"CZE": 5, "SVK": 5, "CHE": 10, "AUT": 5, "POL": 10, "UKR": 15, "BLR": 5,
"MDA": 10, "ROU": 15, "GRC": 15, "NLD": 15, "BEL": 5, "LUX": 5, "NOR": 10,
"SWE": 15, "FIN": 10, "KAZ": 10, "UZB": 10, "KGZ": 5, "TJK": 10, "TKM": 5,
"AZE": 15, "GEO": 15, "ARM": 5, "MAR": 10, "TUN": 5, "LBY": 10, "EGY": 10,
"MRT": 5, "NER": 10, "BFA": 15, "TGO": 10, "BEN": 10, "GNB": 10, "GMB": 10,
"RWA": 5, "BDI": 5, "MWI": 15, "ZWE": 15, "MOZ": 45, "MDG": 15, "MUS": 10,
"ERI": 10, "DJI": 5, "PRY": 20, "CHL": 10, "GUY": 15, "SUR": 15, "JAM": 5,
"TTO": 5, "HND": 10, "SLV": 5, "NIC": 10, "PAN": 10, "FJI": 15, "FSM": 15,
"MHL": 10, "PLW": 10, "NZL": 10, "NRU": 10, "TUV": 10, "WSM": 5, "TON": 5,
"KIR": 5, "YEM": 5, "OMN": 10, "ARE": 5, "SYR": 10, "KHM": 35, "JPN": 15,
"KOR": 3, "ISL": 3, "MNG": 15, "VNM": 110}

# ---------------------------------------------------------------- mean annual temperature C (CCKP 1991-2020, approx)
temperature = {"CAN": -5.4, "RUS": -5.1, "MNG": -0.7, "FIN": 1.7, "NOR": 1.5,
"SWE": 2.1, "ISL": 1.8, "KAZ": 6.4, "USA": 8.5, "CHN": 6.9, "PRK": 5.7,
"KOR": 12.0, "JPN": 11.5, "DEU": 8.5, "FRA": 10.7, "GBR": 8.9, "ITA": 13.5,
"ESP": 13.3, "GRC": 15.4, "TUR": 11.8, "IND": 23.7, "PAK": 21.5, "BGD": 25.0,
"LKA": 27.0, "THA": 26.7, "MYS": 25.4, "IDN": 25.9, "PHL": 25.8, "VNM": 24.5,
"BRA": 24.0, "MEX": 21.0, "ARG": 14.8, "CHL": 8.5, "PER": 17.8, "COL": 21.9,
"VEN": 26.0, "ECU": 20.0, "BOL": 18.2, "URY": 17.5, "PRY": 23.3, "GUY": 26.0,
"SUR": 26.0, "AUS": 21.8, "NZL": 10.6, "ZAF": 17.5, "NGA": 26.9, "ETH": 22.9,
"KEN": 24.5, "EGY": 22.5, "DZA": 22.7, "MAR": 17.9, "SDN": 28.0, "TCD": 28.0,
"NER": 29.0, "MLI": 28.9, "BFA": 28.3, "SEN": 28.0, "MRT": 28.2, "GIN": 25.9,
"CIV": 26.8, "GHA": 27.2, "TGO": 27.0, "BEN": 27.6, "SLE": 26.0, "LBR": 26.0,
"GNB": 26.3, "GMB": 28.5, "CPV": 24.3, "CMR": 24.7, "GAB": 26.0, "COG": 24.5,
"COD": 24.6, "CAF": 26.0, "SSD": 28.0, "UGA": 23.2, "RWA": 20.0, "BDI": 23.0,
"TZA": 23.9, "MOZ": 23.6, "MDG": 22.4, "ZMB": 21.4, "ZWE": 21.2, "BWA": 21.6,
"NAM": 20.5, "AGO": 21.8, "MUS": 22.4, "SYC": 26.2, "COM": 25.5, "DJI": 29.0,
"SOM": 27.9, "ERI": 25.5, "SAU": 24.6, "YEM": 23.9, "OMN": 25.8, "ARE": 27.0,
"QAT": 28.0, "BHR": 27.6, "KWT": 26.2, "IRQ": 22.4, "SYR": 17.3, "JOR": 18.0,
"LBN": 16.7, "ISR": 19.0, "IRN": 17.3, "AFG": 12.6, "UZB": 13.5, "TKM": 15.6,
"KGZ": 1.3, "TJK": 2.0, "AZE": 11.3, "GEO": 5.7, "ARM": 5.5, "BLR": 6.8,
"UKR": 8.3, "MDA": 9.9, "ROU": 8.8, "BGR": 10.6, "ALB": 13.0, "MKD": 11.4,
"SRB": 10.9, "BIH": 9.9, "MNE": 12.0, "HRV": 10.9, "SVN": 10.0, "AUT": 7.0,
"CHE": 5.5, "POL": 8.5, "CZE": 7.9, "SVK": 8.4, "HUN": 10.5, "NLD": 9.5,
"BEL": 9.7, "LUX": 8.9, "IRL": 9.3, "DNK": 8.7, "EST": 5.1, "LVA": 5.6,
"LTU": 6.9, "PRT": 15.6, "MLT": 19.0, "CYP": 18.4, "KHM": 27.0, "LAO": 24.0,
"MMR": 24.0, "NPL": 15.0, "BTN": 9.0, "TLS": 25.0, "PNG": 25.5, "FJI": 24.5,
"SLB": 26.5, "VUT": 23.5, "WSM": 26.5, "TON": 25.0, "KIR": 28.5, "TUV": 28.0,
"FSM": 27.0, "MHL": 28.5, "PLW": 27.5, "NRU": 28.0, "CRI": 22.0, "PAN": 26.0,
"NIC": 25.5, "HND": 23.5, "SLV": 24.0, "GTM": 21.5, "CUB": 25.2, "DOM": 25.0,
"HTI": 25.5, "JAM": 27.0, "TTO": 26.5, "BRB": 26.5, "BHS": 25.5, "ATG": 26.5,
"DMA": 26.0, "GRD": 26.5, "KNA": 26.5, "LCA": 26.5, "VCT": 26.5, "PRI": 26.0,
"VIR": 26.5, "ABW": 28.0, "CUW": 28.0, "LBY": 22.0, "TUN": 19.5, "HKG": 23.0,
"MAC": 22.5, "TWN": 23.0, "SGP": 27.5, "BRN": 27.5, "MDV": 28.0}

# ---------------------------------------------------------------- coffee kg/person/yr (ICO 2023, approx)
coffee = {"FIN": 12.0, "NOR": 9.9, "ISL": 9.0, "DNK": 8.7, "NLD": 8.4,
"SWE": 8.2, "CHE": 7.9, "BEL": 6.8, "LUX": 6.5, "DEU": 6.5, "CAN": 6.2,
"BIH": 6.2, "AUT": 6.1, "SVN": 6.1, "BRA": 6.0, "ITA": 5.9, "HRV": 5.5,
"GRC": 5.7, "PRT": 5.0, "FRA": 5.4, "SRB": 5.4, "CYP": 5.0, "LBN": 5.0,
"ISR": 5.0, "USA": 4.4, "ESP": 4.5, "EST": 4.5, "CRI": 4.0, "DOM": 3.0,
"IRL": 3.5, "JPN": 3.3, "AUS": 2.9, "NZL": 3.0, "GBR": 2.8, "POL": 2.5,
"CZE": 3.0, "HUN": 3.0, "BGR": 3.0, "LTU": 3.0, "LVA": 3.0, "ROU": 2.3,
"DZA": 3.5, "SAU": 2.8, "KWT": 3.0, "JOR": 3.0, "ETH": 2.4, "VNM": 2.3,
"COL": 2.0, "VEN": 2.5, "MEX": 1.7, "GTM": 2.0, "HND": 2.0, "SLV": 2.0,
"NIC": 2.0, "PAN": 2.0, "URY": 3.0, "PRY": 3.0, "BOL": 2.0, "TUR": 1.7,
"RUS": 1.7, "UKR": 1.5, "MDA": 1.5, "BLR": 1.0, "GEO": 2.0, "ARM": 2.0,
"AZE": 1.0, "KAZ": 1.0, "KGZ": 1.0, "TKM": 1.0, "TJK": 0.5, "UZB": 0.5,
"IDN": 1.5, "PHL": 2.0, "MYS": 1.5, "THA": 1.5, "LAO": 2.0, "MMR": 0.5,
"IND": 0.1, "CHN": 0.2, "PAK": 0.1, "BGD": 0.0, "LKA": 0.3, "NPL": 0.2,
"KEN": 0.5, "UGA": 0.6, "RWA": 0.5, "TZA": 0.3, "CIV": 1.0, "CMR": 1.0,
"AGO": 1.0, "ZAF": 1.0, "ZWE": 0.5, "MOZ": 0.3, "MWI": 0.3, "NGA": 0.1,
"GHA": 0.3, "SEN": 1.0, "MLI": 0.5, "BFA": 0.5, "MRT": 1.0, "SOM": 1.0,
"DJI": 2.0, "ERI": 1.0, "YEM": 2.0, "OMN": 1.0, "ARE": 2.0, "QAT": 2.0,
"BHR": 2.0, "IRQ": 2.0, "SYR": 2.0, "IRN": 0.2, "AFG": 0.2, "ECU": 1.0,
"PER": 1.0, "ARG": 1.0, "CHL": 1.0, "CUB": 2.0, "KOR": 2.3}

# ---------------------------------------------------------------- tea kg/person/yr (FAOSTAT/industry 2022, approx)
tea = {"TUR": 3.2, "IRL": 2.2, "GBR": 1.9, "UZB": 2.0, "MRT": 2.0, "IRN": 1.5,
"RUS": 1.4, "MAR": 1.2, "NZL": 1.2, "CHL": 1.2, "KAZ": 1.2, "AFG": 1.2,
"IRQ": 1.2, "EGY": 1.0, "POL": 1.0, "JPN": 1.0, "LKA": 1.3, "MUS": 1.3,
"PAK": 1.0, "SAU": 0.9, "SYR": 1.0, "QAT": 1.3, "BHR": 1.0, "KWT": 1.2,
"ARE": 1.2, "OMN": 1.5, "TKM": 1.5, "KGZ": 1.0, "TJK": 1.0, "AZE": 1.0,
"SDN": 1.5, "LBY": 1.5, "IND": 0.8, "AUS": 0.8, "NLD": 0.8, "DNK": 0.8,
"DEU": 0.7, "MYS": 0.7, "IDN": 0.7, "SWE": 0.7, "FIN": 0.6, "NOR": 0.6,
"ZAF": 0.6, "MMR": 0.6, "CHN": 0.6, "USA": 0.5, "CAN": 0.5, "ARG": 0.3,
"PER": 0.5, "KEN": 0.5, "MWI": 0.5, "GHA": 0.5, "MLI": 0.5, "SEN": 0.5,
"BGD": 0.4, "URY": 0.3, "BRA": 0.1, "NGA": 0.1, "COL": 0.1, "MEX": 0.2,
"ETH": 0.2, "GMB": 1.0, "TUN": 0.8, "DZA": 0.7}

# ---------------------------------------------------------------- beer litres/person/yr (Kirin 2023 report, approx)
beer = {"CZE": 140, "AUT": 105, "POL": 100, "DEU": 92, "ROU": 95, "LTU": 90,
"EST": 90, "HRV": 80, "SVN": 80, "ESP": 85, "VEN": 85, "FIN": 75, "AUS": 75,
"USA": 72, "NAM": 70, "GAB": 70, "MEX": 70, "NLD": 70, "BEL": 70, "IRL": 70,
"SVK": 75, "GBR": 65, "NZL": 65, "RUS": 55, "UKR": 50, "BLR": 50, "BRA": 60,
"ZAF": 60, "PAN": 75, "CRI": 55, "DOM": 60, "CUB": 45, "COL": 50, "PER": 45,
"ARG": 45, "CHL": 45, "URY": 55, "PRY": 45, "BOL": 40, "ECU": 35, "KAZ": 35,
"MNG": 35, "LAO": 35, "JPN": 40, "KOR": 40, "CHN": 25, "THA": 25, "VNM": 45,
"KHM": 25, "PHL": 20, "MYS": 5, "IDN": 1, "IND": 2, "LKA": 5, "NPL": 5,
"MMR": 5, "TUR": 12, "EGY": 5, "MAR": 10, "DZA": 5, "TUN": 15, "ETH": 10,
"NGA": 10, "KEN": 10, "UGA": 10, "TZA": 8, "RWA": 8, "BDI": 5, "ZWE": 15,
"ZMB": 15, "BWA": 20, "MOZ": 10, "MWI": 8, "AGO": 25, "CMR": 30, "CIV": 15,
"GHA": 25, "SEN": 10, "BFA": 5, "MLI": 5, "GIN": 15, "SLE": 10, "LBR": 30,
"CPV": 30, "MUS": 25, "SYC": 60, "FJI": 30, "PNG": 20, "CAN": 60, "GTM": 35,
"HND": 30, "SLV": 25, "NIC": 30, "JAM": 45, "TTO": 45, "BRB": 50, "BHS": 55,
"GUY": 40, "SUR": 40, "PRT": 60, "FRA": 35, "ITA": 35, "GRC": 40, "CYP": 45,
"MLT": 35, "NLD": 70, "DNK": 60, "SWE": 50, "NOR": 55, "ISL": 70, "LUX": 70,
"CHE": 55, "HUN": 65, "BGR": 70, "SRB": 70, "BIH": 70, "MKD": 60, "ALB": 30,
"MNE": 65, "MDA": 55, "GEO": 50, "ARM": 25, "AZE": 15, "KGZ": 25, "TJK": 5,
"SAU": 0, "IRN": 0, "AFG": 0, "PAK": 0, "BGD": 0, "LBY": 0, "SOM": 0,
"MRT": 0, "YEM": 0, "BRN": 0, "KWT": 0, "LKA": 5}

# ---------------------------------------------------------------- wine litres/person/yr (OIV 2023, approx)
wine = {"PRT": 65, "FRA": 46, "ITA": 44, "CHE": 33, "AUT": 30, "GRC": 30,
"DNK": 30, "ESP": 26, "HUN": 25, "ROU": 25, "URY": 25, "GEO": 25, "BEL": 25,
"ARG": 19, "GBR": 20, "NLD": 20, "SWE": 20, "NZL": 20, "MDA": 20, "DEU": 20,
"CHL": 15, "NOR": 15, "USA": 12, "FIN": 12, "ZAF": 10, "AUS": 26, "HRV": 30,
"SVN": 30, "BGR": 25, "SRB": 20, "MKD": 15, "ALB": 10, "MNE": 15, "BIH": 10,
"CYP": 20, "MLT": 20, "LUX": 30, "IRL": 15, "ISL": 12, "POL": 8, "CZE": 20,
"SVK": 15, "EST": 12, "LVA": 12, "LTU": 12, "UKR": 5, "BLR": 5, "RUS": 8,
"KAZ": 5, "KGZ": 5, "ARM": 5, "AZE": 2, "TUR": 1, "LBN": 5, "MAR": 5,
"DZA": 2, "TUN": 5, "BRA": 2, "MEX": 1, "PER": 2, "COL": 1, "JPN": 3,
"CHN": 1, "KOR": 1, "CAN": 12, "CHL": 15, "SAU": 0, "IRN": 0, "AFG": 0,
"PAK": 0, "BGD": 0, "LBY": 0, "SOM": 0, "MRT": 0, "YEM": 0, "BRN": 0,
"KWT": 0}

# ---------------------------------------------------------------- bird species (IUCN/BirdLife totals, rounded)
birds = {"COL": 1900, "PER": 1850, "BRA": 1800, "IDN": 1750, "ECU": 1650,
"VEN": 1400, "BOL": 1400, "CHN": 1350, "IND": 1350, "COD": 1150, "MEX": 1100,
"USA": 1100, "KEN": 1100, "TZA": 1100, "UGA": 1050, "THA": 1000, "ARG": 1000,
"MMR": 1000, "CMR": 950, "AGO": 950, "NGA": 950, "SDN": 950, "MYS": 800,
"PNG": 800, "ZAF": 850, "ETH": 850, "VNM": 850, "NPL": 850, "AUS": 850,
"PHL": 700, "LAO": 700, "RWA": 700, "CAF": 700, "GAB": 700, "GIN": 700,
"CAN": 700, "RUS": 750, "ZMB": 750, "GHA": 750, "CIV": 750, "MOZ": 750,
"SLE": 650, "SEN": 650, "NAM": 650, "KHM": 600, "COG": 600, "TGO": 600,
"BEN": 600, "BDI": 600, "JPN": 600, "GBR": 600, "TCD": 550, "FRA": 550,
"ESP": 550, "ITA": 550, "PRT": 500, "DEU": 500, "NOR": 500, "SWE": 500,
"NLD": 500, "MAR": 500, "TUR": 500, "KAZ": 500, "PAK": 750, "BGD": 700,
"LKA": 450, "KOR": 500, "PRK": 450, "MNG": 450, "EGY": 450, "DNK": 450,
"IRL": 450, "FIN": 450, "POL": 450, "GRC": 450, "CYP": 400, "MLT": 400,
"EST": 400, "LVA": 400, "LTU": 400, "CHE": 400, "CZE": 400, "SVK": 400,
"HUN": 400, "ROU": 450, "BGR": 400, "ALB": 350, "MKD": 350, "SRB": 350,
"BIH": 350, "MNE": 350, "HRV": 400, "SVN": 380, "AUT": 450, "SYC": 200,
"ISL": 250, "MDG": 300, "LSO": 350, "MUS": 60, "KWT": 400, "IRQ": 400,
"SYR": 400, "JOR": 400, "LBN": 350, "ISR": 550, "IRN": 550, "AFG": 500,
"GEO": 350, "ARM": 350, "AZE": 400, "UZB": 450, "TKM": 450, "KGZ": 400,
"TJK": 400, "SAU": 500, "YEM": 400, "OMN": 550, "ARE": 450, "DZA": 400,
"TUN": 350, "LBY": 350, "CRI": 900, "PAN": 950, "NIC": 750, "HND": 750,
"GTM": 750, "SLV": 550, "CUB": 400, "DOM": 350, "HTI": 300, "JAM": 300,
"TTO": 450, "GUY": 800, "SUR": 750, "FJI": 180, "SLB": 250, "VUT": 200,
"NZL": 350, "WSM": 80, "TON": 70, "KIR": 90, "FSM": 180, "MHL": 100,
"ZWE": 700, "BWA": 600, "MWI": 650, "SWZ": 500, "LBR": 600, "GMB": 600,
"GNB": 550, "CPV": 200, "DJI": 350, "ERI": 550, "SOM": 650, "SSD": 950,
"MRT": 550, "NER": 550, "MLI": 650, "BFA": 550, "DZA": 400, "COD": 1150,
"PRY": 700, "URY": 450, "CHL": 550}

# ---------------------------------------------------------------- amphibian species (IUCN, rounded)
amphibians = {"BRA": 1100, "COL": 750, "ECU": 630, "PER": 580, "MEX": 390,
"VEN": 330, "CHN": 320, "IDN": 300, "IND": 300, "USA": 300, "COD": 250,
"BOL": 250, "AUS": 230, "PAN": 200, "CRI": 200, "TZA": 200, "CMR": 200,
"MYS": 200, "VNM": 200, "ARG": 170, "GTM": 150, "HND": 130, "THA": 150,
"ZAF": 130, "PHL": 110, "LKA": 110, "MMR": 100, "LAO": 100, "GAB": 100,
"KEN": 110, "NIC": 80, "PRY": 80, "CUB": 70, "DOM": 70, "JPN": 70, "ETH": 70,
"KHM": 70, "CHL": 60, "RWA": 60, "HTI": 50, "NPL": 50, "URY": 50, "FRA": 40,
"BGD": 40, "ESP": 35, "GRC": 25, "PAK": 25, "JAM": 25, "DEU": 20, "KOR": 20,
"PNG": 350, "MDG": 300, "UGA": 90, "COG": 80, "CAF": 70, "AGO": 80,
"ZMB": 80, "MOZ": 80, "MWI": 60, "ZWE": 60, "NAM": 60, "BWA": 40, "SOM": 40,
"SDN": 40, "TCD": 30, "NER": 20, "MLI": 30, "BFA": 25, "SEN": 30, "GIN": 40,
"SLE": 40, "LBR": 40, "CIV": 50, "GHA": 40, "TGO": 30, "BEN": 30, "NGA": 110,
"GAB": 100, "ITA": 45, "TUR": 35, "IRN": 20, "MAR": 15, "DZA": 10, "EGY": 8,
"SAU": 10, "YEM": 10, "OMN": 8, "RUS": 30, "CAN": 25, "KAZ": 15, "MNG": 10,
"NZL": 8, "GBR": 8, "IRL": 5, "ISL": 2, "NOR": 8, "SWE": 12, "FIN": 6,
"POL": 18, "NLD": 15, "BEL": 12, "CHE": 18, "AUT": 20, "CZE": 20, "HUN": 18,
"ROU": 20, "PRT": 20, "GRC": 25, "IND": 300, "VNM": 200, "KHM": 70}

# ---------------------------------------------------------------- reptile species (IUCN, rounded)
reptiles = {"AUS": 860, "MEX": 850, "BRA": 760, "IDN": 700, "IND": 600,
"CHN": 450, "USA": 530, "COL": 600, "VEN": 400, "ECU": 400, "PER": 450,
"BOL": 300, "ARG": 400, "PRY": 180, "URY": 70, "CHL": 130, "THA": 400,
"MYS": 400, "VNM": 350, "PHL": 350, "PNG": 350, "MMR": 300, "KHM": 180,
"LAO": 200, "NPL": 120, "PAK": 200, "BGD": 160, "LKA": 230, "JPN": 100,
"KOR": 30, "TWN": 100, "ZAF": 400, "NAM": 300, "BWA": 250, "AGO": 300,
"MOZ": 250, "MDG": 400, "TZA": 350, "KEN": 350, "ETH": 250, "SOM": 250,
"SDN": 250, "EGY": 120, "DZA": 120, "MAR": 120, "LBY": 100, "TUN": 80,
"MRT": 100, "MLI": 150, "NER": 120, "TCD": 150, "BFA": 100, "SEN": 120,
"GIN": 130, "SLE": 100, "LBR": 110, "CIV": 150, "GHA": 150, "TGO": 100,
"BEN": 100, "NGA": 250, "CMR": 280, "GAB": 200, "COG": 180, "COD": 300,
"CAF": 180, "SSD": 150, "UGA": 180, "RWA": 80, "BDI": 70, "MWI": 150,
"ZMB": 200, "ZWE": 180, "SWZ": 120, "LSO": 50, "MUS": 30, "SYC": 30,
"COM": 40, "DJI": 80, "ERI": 120, "SAU": 120, "YEM": 150, "OMN": 180,
"ARE": 80, "QAT": 50, "BHR": 30, "KWT": 60, "IRQ": 100, "SYR": 100,
"JOR": 100, "LBN": 60, "ISR": 100, "TUR": 140, "IRN": 250, "AFG": 120,
"GEO": 60, "ARM": 50, "AZE": 80, "KAZ": 60, "UZB": 70, "TKM": 80, "KGZ": 40,
"TJK": 50, "MNG": 30, "PRK": 40, "CRI": 250, "PAN": 280, "NIC": 180,
"HND": 180, "GTM": 220, "SLV": 100, "CUB": 160, "DOM": 170, "HTI": 130,
"JAM": 60, "TTO": 70, "BRB": 20, "GUY": 200, "SUR": 200, "FJI": 50,
"SLB": 120, "VUT": 80, "NZL": 120, "CAN": 50, "RUS": 80, "KAZ": 60,
"ESP": 45, "PRT": 40, "ITA": 60, "GRC": 70, "FRA": 45, "DEU": 25, "GBR": 15}

# ---------------------------------------------------------------- active (Holocene) volcanoes (Smithsonian GVP, counts)
volcanoes = {"IDN": 130, "USA": 170, "RUS": 150, "JPN": 110, "CHL": 90,
"ETH": 60, "PNG": 55, "PHL": 50, "MEX": 45, "ARG": 40, "GTM": 35, "ISL": 30,
"NIC": 25, "SLV": 25, "ECU": 25, "COL": 15, "PER": 15, "CRI": 10, "BOL": 10,
"KEN": 10, "TZA": 10, "CAN": 20, "NZL": 15, "ITA": 15, "GRC": 5, "TUR": 15,
"IRN": 5, "SAU": 10, "YEM": 5, "COD": 5, "CMR": 5, "CPV": 5, "COM": 5,
"MDG": 5, "VUT": 10, "SLB": 10, "FJI": 5, "TON": 5, "FRA": 5, "PRT": 5,
"ESP": 5, "DEU": 5, "GBR": 5, "NOR": 5, "AUS": 5, "CHN": 15, "PRK": 5,
"KOR": 5, "TWN": 5, "MMR": 5, "IND": 5, "HND": 10, "PAN": 5, "DNK": 5}

# ---------------------------------------------------------------- Nobel laureates by country (nobelprize.org, all prizes, approx; 0 = none ever)
_NOBEL = {"USA": 400, "GBR": 138, "DEU": 115, "FRA": 76, "SWE": 34, "RUS": 30,
"JPN": 29, "CHE": 25, "CAN": 28, "NLD": 22, "AUT": 22, "ITA": 21, "DNK": 14,
"NOR": 13, "IND": 9, "ISR": 13, "AUS": 14, "POL": 18, "HUN": 14, "BEL": 11,
"ESP": 8, "CHN": 8, "ZAF": 11, "EGY": 4, "NGA": 1, "KEN": 1, "ETH": 1,
"LBR": 2, "GHA": 1, "YEM": 1, "IRN": 2, "MMR": 1, "TLS": 1, "BGD": 1,
"PAK": 2, "TUR": 2, "BRA": 1, "ARG": 5, "MEX": 3, "COL": 2, "VEN": 1,
"CHL": 2, "GTM": 2, "CRI": 1, "PER": 1, "PRT": 2, "GRC": 2, "UKR": 6,
"CZE": 6, "FIN": 5, "IRL": 11, "NZL": 3, "LUX": 1, "KOR": 1, "TWN": 1,
"VNM": 1, "ROU": 4, "BLR": 1, "HRV": 2, "SRB": 1, "SVN": 1, "ISL": 1}
nobel = {i: _NOBEL.get(i, 0) for i in isos}

# ---------------------------------------------------------------- Olympic medals, all-time Summer+Winter (Olympedia, approx; 0 = none ever)
_OLY = {"USA": 3000, "CHN": 700, "GBR": 1000, "FRA": 900, "ITA": 800,
"DEU": 900, "JPN": 600, "AUS": 600, "RUS": 600, "CAN": 550, "SWE": 680,
"NOR": 580, "FIN": 500, "NLD": 400, "HUN": 520, "POL": 350, "ROU": 300,
"BGR": 200, "CZE": 100, "KOR": 400, "PRK": 50, "CUB": 240, "KEN": 120,
"ETH": 60, "JAM": 90, "NZL": 140, "ESP": 180, "BRA": 170, "ARG": 80,
"MEX": 75, "IND": 40, "PAK": 10, "NGA": 25, "ZAF": 90, "EGY": 40, "MAR": 25,
"DZA": 20, "TUN": 15, "TUR": 100, "IRN": 80, "KAZ": 80, "UZB": 40,
"GEO": 40, "AZE": 50, "ARM": 20, "BLR": 100, "UKR": 150, "DNK": 200,
"BEL": 170, "CHE": 220, "AUT": 110, "IRL": 40, "PRT": 30, "GRC": 130,
"SRB": 20, "HRV": 55, "SVN": 28, "SVK": 35, "BIH": 3, "MKD": 2, "MNE": 1,
"LUX": 4, "CYP": 1, "ISL": 4, "EST": 40, "LVA": 28, "LTU": 26, "MDA": 8,
"KGZ": 8, "TJK": 4, "TKM": 1, "MNG": 30, "VNM": 4, "THA": 35, "MYS": 13,
"SGP": 5, "IDN": 38, "PHL": 14, "HKG": 9, "TWN": 36, "LKA": 2, "AFG": 2,
"IRQ": 1, "SYR": 3, "JOR": 2, "LBN": 2, "ISR": 13, "SAU": 3, "QAT": 4,
"BHR": 4, "KWT": 3, "ARE": 2, "SDN": 1, "ERI": 1, "UGA": 10, "BDI": 2,
"TZA": 2, "MOZ": 2, "ZMB": 2, "ZWE": 8, "BWA": 2, "NAM": 5, "MUS": 1,
"CPV": 1, "CIV": 4, "GHA": 5, "TGO": 1, "NER": 2, "BFA": 1, "SEN": 1,
"CMR": 6, "GAB": 1, "COL": 34, "VEN": 19, "ECU": 5, "PER": 4, "PRY": 1,
"URY": 10, "CHL": 13, "GUY": 1, "SUR": 2, "GTM": 1, "CRI": 4, "PAN": 3,
"DOM": 10, "HTI": 2, "TTO": 19, "BRB": 1, "BHS": 14, "GRD": 3, "DMA": 1,
"LCA": 2, "FJI": 4, "WSM": 1, "TON": 1, "BMU": 2, "PRI": 2, "ISV": 1,
"CS-KM": 3}
olympics = {i: _OLY.get(i, 0) for i in isos}

# ---------------------------------------------------------------- UNESCO World Heritage Sites (whc.unesco.org, 2024, approx; 0 = none)
_WHS = {"ITA": 60, "CHN": 59, "DEU": 54, "FRA": 53, "ESP": 50, "IND": 43,
"MEX": 35, "GBR": 35, "RUS": 32, "IRN": 28, "USA": 26, "JPN": 26, "BRA": 24,
"CAN": 22, "AUS": 20, "GRC": 19, "TUR": 21, "PRT": 17, "POL": 17, "CZE": 17,
"BEL": 16, "SWE": 15, "PER": 13, "KOR": 16, "NLD": 13, "CHE": 13, "AUT": 12,
"DNK": 11, "NOR": 8, "FIN": 7, "IRL": 2, "ISL": 3, "NZL": 3, "ZAF": 12,
"EGY": 7, "MAR": 9, "DZA": 7, "TUN": 9, "LBY": 5, "ETH": 12, "KEN": 8,
"SEN": 7, "MLI": 4, "NER": 3, "BFA": 3, "CIV": 4, "GHA": 2, "NGA": 2,
"CMR": 2, "COD": 5, "TZA": 7, "UGA": 3, "RWA": 2, "MDG": 3, "MUS": 2,
"SYC": 2, "SAU": 8, "YEM": 4, "OMN": 5, "ARE": 1, "QAT": 1, "BHR": 3,
"IRQ": 6, "SYR": 6, "JOR": 5, "LBN": 5, "ISR": 9, "PSE": 4, "AFG": 2,
"PAK": 6, "BGD": 3, "LKA": 8, "NPL": 4, "MMR": 2, "THA": 8, "MYS": 4,
"IDN": 10, "PHL": 6, "VNM": 8, "KHM": 4, "LAO": 3, "MNG": 6, "KAZ": 6,
"UZB": 5, "TKM": 3, "KGZ": 3, "TJK": 4, "AZE": 5, "GEO": 4, "ARM": 3,
"PRK": 2, "SGP": 1, "MAC": 1, "FJI": 1, "PNG": 1, "SLB": 1, "VUT": 1,
"KIR": 1, "FSM": 1, "MHL": 1, "PLW": 1, "COL": 9, "VEN": 3, "ECU": 5,
"BOL": 7, "CHL": 7, "ARG": 12, "URY": 3, "SUR": 2, "CUB": 9, "DOM": 1,
"HTI": 1, "JAM": 1, "BRB": 1, "ATG": 1, "DMA": 1, "KNA": 1, "LCA": 1,
"CRI": 4, "PAN": 5, "NIC": 2, "HND": 2, "SLV": 1, "GTM": 4, "BLZ": 1,
"ALB": 4, "MKD": 2, "SRB": 5, "BIH": 4, "MNE": 4, "HRV": 10, "SVN": 5,
"SVK": 8, "HUN": 8, "ROU": 11, "BGR": 10, "MDA": 1, "UKR": 8, "BLR": 4,
"LTU": 5, "LVA": 3, "EST": 2, "VAT": 2, "SMR": 1, "AND": 1, "MLT": 3,
"CYP": 3, "LUX": 1}
unesco = {i: _WHS.get(i, 0) for i in isos}

# ---------------------------------------------------------------- Freedom House status 2024, approx (0 Free, 1 Partly Free, 2 Not Free)
_FREE = """USA CAN CRI PAN DOM JAM TTO BRB BHS GRD ATG DMA KNA LCA VCT GUY SUR
BRA URY ARG CHL BLZ GBR IRL NOR SWE DNK FIN ISL DEU FRA ITA ESP PRT NLD BEL
LUX CHE AUT POL CZE SVK SVN HRV ROU BGR GRC CYP MLT EST LVA LTU MNE AND MCO
SMR LIE JPN KOR TWN MNG ISR AUS NZL VUT WSM TON KIR FSM MHL PLW NRU TUV ZAF
NAM BWA GHA SEN CPV STP MUS SYC LSO GRL FRO""".split()
_PARTLY = """MEX GTM HND SLV COL ECU PER BOL PRY HUN SRB BIH MKD ALB MDA UKR IND
PAK BGD LKA NPL BTN MYS IDN PHL THA TLS SGP MDV IRQ LBN JOR KWT TUR GEO ARM
KGZ HKG FJI PNG SLB KEN TZA AGO ZMB MWI MOZ MDG COM GMB GNB BEN TGO CIV LBR
SLE GIN NGA NER MRT MAR DZA TUN NCL PYF PRI GUM BMU FLK GUF CS-KM""".split()
_NOT = """NIC CUB HTI VEN BLR RUS MMR CHN PRK VNM LAO KHM BRN AFG IRN SYR PSE SAU
YEM OMN ARE QAT BHR KAZ UZB TKM TJK AZE MAC ZWE SWZ UGA RWA BDI ETH ERI DJI SOM
SSD SDN CAF TCD CMR COG COD GAB GNQ MLI BFA LBY EGY ESH""".split()
democracy = {}
for i in isos:
    if i in _FREE: democracy[i] = 0
    elif i in _PARTLY: democracy[i] = 1
    elif i in _NOT: democracy[i] = 2

# ---------------------------------------------------------------- legal system (0 civil, 1 common, 2 mixed, 3 religious/customary)
_COMMON = """GBR IRL USA CAN AUS NZL IND PAK BGD MMR MYS SGP HKG FJI GHA NGA KEN
UGA TZA GMB SLE LBR ZMB ZWE MWI JAM TTO BRB BHS GRD ATG DMA KNA LCA VCT GUY BLZ
PNG WSM TON KIR NRU TUV""".split()
_MIXED = """ZAF BWA NAM LSO SWZ MUS SYC CYP MLT NPL LKA PHL ISR CMR SOM SDN ERI
TCD GNB GIN VUT FSM MHL PLW""".split()
_RELI = ["SAU", "IRN", "VAT", "AFG"]
legal = {}
for i in isos:
    if i in _COMMON: legal[i] = 1
    elif i in _MIXED: legal[i] = 2
    elif i in _RELI: legal[i] = 3
    else: legal[i] = 0

# ---------------------------------------------------------------- plug types (0 A/B, 1 C/E/F, 2 G, 3 D/M, 4 I, 5 other)
_PLUG = {"USA": 0, "CAN": 0, "MEX": 0, "GTM": 0, "BLZ": 0, "HND": 0, "SLV": 0,
"NIC": 0, "CRI": 0, "PAN": 0, "CUB": 0, "HTI": 0, "DOM": 0, "JAM": 0, "TTO": 0,
"BHS": 0, "BRB": 0, "VEN": 0, "COL": 0, "ECU": 0, "PER": 0, "BOL": 0, "GUY": 0,
"JPN": 0, "TWN": 0, "PHL": 0, "THA": 0, "VNM": 0, "KHM": 0, "LAO": 0, "LBR": 0,
"YEM": 0, "FSM": 0, "MHL": 0, "PLW": 0,
"GBR": 2, "IRL": 2, "MLT": 2, "HKG": 2, "SGP": 2, "MYS": 2, "BRN": 2, "GMB": 2,
"GHA": 2, "NGA": 2, "SLE": 2, "ZWE": 2, "KEN": 2, "UGA": 2, "TZA": 2, "MWI": 2,
"ZMB": 2, "MUS": 2, "SYC": 2, "QAT": 2, "BHR": 2, "KWT": 2, "ARE": 2, "SAU": 2,
"OMN": 2, "JOR": 2, "MDV": 2, "MAC": 2, "CYP": 2, "SLB": 2, "KIR": 2, "TUV": 2,
"IND": 3, "PAK": 3, "BGD": 3, "LKA": 3, "NPL": 3, "BTN": 3, "ZAF": 3, "NAM": 3,
"LSO": 3, "SWZ": 3, "SDN": 3, "SSD": 3,
"AUS": 4, "NZL": 4, "CHN": 4, "ARG": 4, "PNG": 4, "FJI": 4, "WSM": 4, "TON": 4,
"NRU": 4,
"ISR": 5, "PSE": 5, "CHE": 5, "LIE": 5, "RWA": 5, "DNK": 5, "GRL": 5, "ITA": 5,
"CHL": 5, "URY": 5, "LBY": 5, "BRA": 5}
plugs = {i: _PLUG.get(i, 1) for i in isos}

# ---------------------------------------------------------------- metric (1) vs non-metric (0: USA, Liberia, Myanmar)
metric = {i: (0 if i in ("USA", "LBR", "MMR") else 1) for i in isos}

# ---------------------------------------------------------------- membership blocs (EU/NATO/G20/OPEC binary; BRICS 0/1 full/2 partner)
_EU = """AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX
MLT NLD POL PRT ROU SVK SVN ESP SWE""".split()
_NATO = """ALB BEL BGR CAN HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LTU LUX
MNE NLD MKD NOR POL PRT ROU SVK SVN ESP SWE TUR GBR USA""".split()
_BRICS = ["BRA", "RUS", "IND", "CHN", "ZAF", "EGY", "ETH", "IDN", "IRN", "ARE"]
_BRICS_P = ["BLR", "BOL", "CUB", "KAZ", "MYS", "THA", "UGA", "UZB", "NGA", "VNM"]
_OPEC = ["DZA", "COG", "GNQ", "GAB", "IRN", "IRQ", "KWT", "LBY", "NGA", "SAU", "ARE", "VEN"]
_G20 = ["ARG", "AUS", "BRA", "CAN", "CHN", "FRA", "DEU", "IND", "IDN", "ITA",
"JPN", "MEX", "RUS", "SAU", "ZAF", "KOR", "TUR", "GBR", "USA"]
eu = {i: (1 if i in _EU else 0) for i in isos}
nato = {i: (1 if i in _NATO else 0) for i in isos}
brics = {i: (1 if i in _BRICS else (2 if i in _BRICS_P else 0)) for i in isos}
opec = {i: (1 if i in _OPEC else 0) for i in isos}
g20 = {i: (1 if i in _G20 else 0) for i in isos}

# ---------------------------------------------------------------- dominant language family (0 Indo-European + 15 others)
_LANGFAM = {"MAR": 1, "DZA": 1, "TUN": 1, "LBY": 1, "EGY": 1, "MRT": 1,
"NER": 1, "TCD": 1, "DJI": 1, "SOM": 1, "ETH": 1, "ERI": 1, "SDN": 1, "YEM": 1,
"SAU": 1, "OMN": 1, "ARE": 1, "QAT": 1, "BHR": 1, "KWT": 1, "IRQ": 1, "SYR": 1,
"JOR": 1, "LBN": 1, "ISR": 1, "PSE": 1, "MLT": 1,
"MLI": 2, "BFA": 2, "SEN": 2, "GIN": 2, "GNB": 2, "GMB": 2, "SLE": 2, "LBR": 2,
"CIV": 2, "GHA": 2, "TGO": 2, "BEN": 2, "NGA": 2, "CMR": 2, "GAB": 2, "COG": 2,
"COD": 2, "CAF": 2, "RWA": 2, "BDI": 2, "KEN": 2, "UGA": 2, "TZA": 2, "MWI": 2,
"MOZ": 2, "ZMB": 2, "ZWE": 2, "BWA": 2, "NAM": 2, "AGO": 2, "ZAF": 2, "LSO": 2,
"SWZ": 2, "COM": 2,
"SSD": 3,
"CHN": 4, "TWN": 4, "HKG": 4, "MAC": 4, "MMR": 4, "BTN": 4, "SGP": 4,
"MYS": 5, "IDN": 5, "PHL": 5, "BRN": 5, "TLS": 5, "FJI": 5, "VUT": 5, "WSM": 5,
"TON": 5, "KIR": 5, "TUV": 5, "NRU": 5, "FSM": 5, "MHL": 5, "PLW": 5, "MDG": 5,
"VNM": 6, "KHM": 6, "THA": 7, "LAO": 7,
"TUR": 8, "AZE": 8, "KAZ": 8, "KGZ": 8, "UZB": 8, "TKM": 8,
"FIN": 9, "EST": 9, "HUN": 9, "JPN": 10, "PRK": 11, "KOR": 11, "MNG": 12,
"PNG": 13, "GRL": 14, "GEO": 15, "NCL": 5, "PYF": 5, "GUM": 5}
langfam = {i: _LANGFAM.get(i, 0) for i in isos}

# ---------------------------------------------------------------- government type (0 republic, 1 monarchy, 2 one-party, 3 theocracy)
_MON = """GBR NOR SWE DNK NLD BEL ESP LUX MCO LIE AND JPN THA KHM MYS BRN SAU ARE
QAT KWT BHR OMN JOR BTN TON MAR LSO SWZ""".split()
gov = {i: 0 for i in isos}
for i in _MON:
    if i in gov: gov[i] = 1
for i in ("CHN", "VNM", "LAO", "CUB", "PRK"):
    gov[i] = 2
for i in ("IRN", "VAT"):
    if i in gov: gov[i] = 3

# ---------------------------------------------------------------- coffee production, tonnes (FAO 2023, approx; 0 = ~none)
_COFFEEP = {"BRA": 3900000, "VNM": 1800000, "COL": 800000, "ETH": 850000,
"IDN": 760000, "HND": 400000, "UGA": 400000, "IND": 350000, "PER": 350000,
"MEX": 250000, "GTM": 250000, "LAO": 120000, "CIV": 100000, "CRI": 85000,
"KEN": 50000, "MYS": 15000, "THA": 50000, "PHL": 60000, "NIC": 150000,
"CHN": 120000, "CMR": 50000, "TZA": 65000, "MDG": 50000, "GIN": 20000,
"RWA": 30000, "BDI": 15000, "MWI": 10000, "COD": 25000, "SLE": 15000,
"LBR": 10000, "AGO": 15000, "CAF": 10000, "TGO": 10000, "GHA": 10000,
"NGA": 5000, "ZMB": 5000, "ZWE": 5000, "SLV": 45000, "VEN": 60000,
"ECU": 50000, "BOL": 25000, "CUB": 10000, "DOM": 35000, "HTI": 20000,
"JAM": 8000, "PAN": 10000, "TTO": 1000, "PRY": 1000, "PNG": 50000,
"SLB": 5000, "VUT": 1000, "FJI": 1000, "YEM": 15000, "KHM": 5000,
"TLS": 10000, "MOZ": 2000}
coffeeProd = {i: _COFFEEP.get(i, 0) for i in isos}

# ---------------------------------------------------------------- chocolate consumption kg/person/yr (industry reports, approx)
choco = {"CHE": 8.8, "AUT": 8.1, "DEU": 7.9, "GBR": 7.5, "NOR": 7.3,
"DNK": 7.0, "SWE": 6.5, "FIN": 6.0, "NLD": 6.0, "BEL": 6.0, "IRL": 6.0,
"USA": 4.5, "CAN": 4.0, "AUS": 4.0, "NZL": 4.0, "FRA": 4.0, "ITA": 3.0,
"ESP": 2.0, "PRT": 2.0, "GRC": 2.0, "POL": 3.0, "CZE": 2.0, "RUS": 3.0,
"JPN": 2.0, "KOR": 1.0, "BRA": 1.5, "ARG": 2.0, "MEX": 1.0, "ZAF": 1.0,
"TUR": 2.0, "SAU": 1.0, "ISR": 2.0}

# ---------------------------------------------------------------- Olympic medals per million (computed from medals + WB 2024 pop)
pop2024 = {}
try:
    _wb = json.loads((root / "data/wb/population.json").read_text())["countries"]
    for _iso, _years in _wb.items():
        _vs = [(int(_y), _v) for _y, _v in _years.items() if _y.isdigit() and _v]
        if _vs:
            _y, _v = max(_vs)
            pop2024[_iso] = (_y, _v)
    _py = max(_y for _y, _ in pop2024.values())
    pop2024.update({"TWN": (_py, 23.9e6), "HKG": (_py, 7.5e6),
                    "PRI": (_py, 3.2e6), "BMU": (_py, 0.064e6),
                    "ISV": (_py, 0.087e6), "CS-KM": (_py, 1.6e6)})
    olympicsPC = {i: round(olympics.get(i, 0) / pop2024[i][1] * 1e6, 1)
                   for i in isos if i in pop2024 and pop2024[i][1]}
    print(f"olympicsPC computed for {len(olympicsPC)} countries (pop year {_py})")
except Exception as e:
    print("olympicsPC skipped:", e)
    olympicsPC = {}

MAPS = {"coffee": coffee, "tea": tea, "beer": beer, "wine": wine,
        "languages": languages, "temperature": temperature, "birds": birds,
        "amphibians": amphibians, "reptiles": reptiles,
        "volcanoes": volcanoes, "timezones": timezones, "driving": driving,
        "landlocked": landlocked, "nobel": nobel, "olympics": olympics,
        "olympicsPC": olympicsPC, "unesco": unesco, "democracy": democracy,
        "legal": legal, "plugs": plugs, "metric": metric, "eu": eu,
        "nato": nato, "brics": brics, "opec": opec, "g20": g20,
        "langfam": langfam, "gov": gov, "coffeeProd": coffeeProd,
        "choco": choco}
FULL_COV = {"timezones", "driving", "landlocked", "nobel", "olympics",
            "olympicsPC", "unesco", "democracy", "legal", "plugs", "metric",
            "eu", "nato", "brics", "opec", "g20", "langfam", "gov",
            "coffeeProd"}

out = root / "data/curated-extra.js"
body = "// GENERATED by scripts/build-curated-extra.py — do not hand-edit.\n"
body += "// Rounded snapshot values; provenance per dataset in data/README.md.\n"
body += "const CURATED_EXTRA = " + json.dumps(MAPS, separators=(",", ":")) + ";\n"
out.write_text(body)

print(f"Wrote {out} ({out.stat().st_size/1024:.0f} KiB)")
for name, m in MAPS.items():
    if name in FULL_COV:
        missing = [i for i in isos if i not in m and i not in ("ATA", "-99")]
        flag = f"  MISSING: {missing}" if missing else "  (full coverage)"
        print(f"{name:12s} countries={len(m):3d}{flag}")
    else:
        missing = [i for i in isos if i not in m]
        print(f"{name:12s} countries={len(m):3d}  (no-data: {len(missing)})")
assert all(v >= 0 for n, m in MAPS.items() if n != "temperature" for v in m.values()), "negative value!"
