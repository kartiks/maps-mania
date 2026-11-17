#!/usr/bin/env node
/**
 * Refresh the committed local data record (data/wb/*.json) from the World
 * Bank API — properly paginated (the old in-browser fetch read only page 1
 * and silently dropped countries), aggregate-filtered, and validated
 * (Argentina/Australia/India must be present or the script fails loudly
 * instead of shipping a map with missing countries).
 *
 *   node scripts/fetch-data.mjs            # refresh all datasets
 *   node scripts/fetch-data.mjs population # refresh one
 *
 * The website itself does NOT depend on this: it reads data/wb/*.json first
 * and only revalidates against the API in the background (see app.js).
 * If api.worldbank.org is unreachable/WAF-blocked on your network, build the
 * same files from the official bulk download instead:
 *   python3 scripts/build-snapshot-from-wdi.py WDI_CSV.zip
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const INDICATORS = {
  population: 'SP.POP.TOTL', density: 'EN.POP.DNST', birthRate: 'SP.DYN.CBRT.IN',
  lifeExpect: 'SP.DYN.LE00.IN', gdp: 'NY.GDP.MKTP.CD', gdpCap: 'NY.GDP.PCAP.CD',
  gdpGrowth: 'NY.GDP.MKTP.KD.ZG', unemployment: 'SL.UEM.TOTL.ZS', literacy: 'SE.ADT.LITR.ZS',
  internet: 'IT.NET.USER.ZS', urban: 'SP.URB.TOTL.IN.ZS', forest: 'AG.LND.FRST.ZS',
  renewable: 'EG.FEC.RNEW.ZS', co2: 'EN.GHG.CO2.PC.CE.AR5', rainfall: 'AG.LND.PRCP.MM',
  popGrowth: 'SP.POP.GROW', fertility: 'SP.DYN.TFRT.IN',
  electricity: 'EG.ELC.ACCS.ZS', mobiles: 'IT.CEL.SETS.P2',
  childMort: 'SH.DYN.MORT', elderly: 'SP.POP.65UP.TO.ZS',
  undernourish: 'SN.ITK.DEFC.ZS', gini: 'SI.POV.GINI',
  military: 'MS.MIL.XPND.GD.ZS', tourism: 'ST.INT.ARVL',
  protected: 'ER.LND.PTLD.ZS', eduSpend: 'SE.XPD.TOTL.GD.ZS',
  rdSpend: 'GB.XPD.RSDV.GD.ZS', ageDep: 'SP.POP.DPND',
  broadband: 'IT.NET.BBND.P2', foodProd: 'AG.PRD.FOOD.XD',
  trade: 'NE.TRD.GNFS.ZS', maternal: 'SH.STA.MMRT',
  femaleLabor: 'SL.TLF.CACT.FE.ZS',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'MapsMania-DataSync/1.0' } });
    const t = await r.text();
    if (r.ok && t.trim().startsWith('[')) return JSON.parse(t);
    console.warn(`  retry ${i + 1}: HTTP ${r.status} (API may be rate-limiting)`);
    await sleep(1500 * (i + 1));
  }
  throw new Error(`World Bank API unreachable for ${url} — keep the existing snapshot, or use the bulk-download builder (see header).`);
}
// Exact aggregate code list from WDI WDICountry.csv (rows with no Region).
// Indicator responses can't be trusted for region info, so filter by code.
const AGG = new Set('AFE AFW ARB CEB CSS EAP EAR EAS ECA ECS EMU EUU FCV HIC HPC IBD IBT IDA IDB IDX LAC LCN LDC LIC LMC LMY LTE MEA MIC MNA NAC OED OSS PRE PSS PST SAS SSA SSF SST TEA TEC TLA TMN TSA TSS UMC WLD'.split(' '));
async function fetchIndicator(code) {
  const countries = {}; let page = 1, pages = 1;
  do {
    const [meta, rows] = await getJson(`https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&per_page=1000&page=${page}&date=1960:2025`);
    pages = meta.pages;
    for (const row of rows || []) {
      if (!row.countryiso3code || row.countryiso3code.length !== 3 || AGG.has(row.countryiso3code) || row.value == null || !isFinite(+row.value)) continue;
      (countries[row.countryiso3code] ??= {})[row.date] = Math.round(row.value * 10000) / 10000;
    }
    page++;
  } while (page <= pages);
  return countries;
}
mkdirSync(new URL('../data/wb/', import.meta.url), { recursive: true });
const only = process.argv[2];
for (const [id, code] of Object.entries(INDICATORS)) {
  if (only && only !== id) continue;
  process.stdout.write(`${id} (${code})… `);
  const countries = await fetchIndicator(code);
  for (const must of ['ARG', 'AUS', 'IND']) if (!countries[must]) throw new Error(`${id}: ${must} missing — refusing to write an incomplete snapshot`);
  const years = [...new Set(Object.values(countries).flatMap(v => Object.keys(v)))].sort();
  const payload = { id, code, source: 'World Bank WDI', fetchedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), years, countries };
  const text = JSON.stringify(payload);
  writeFileSync(new URL(`../data/wb/${id}.json`, import.meta.url), text);
  console.log(`${Object.keys(countries).length} countries, ${years[0]}–${years.at(-1)}, sha ${createHash('sha256').update(text).digest('hex').slice(0, 16)}`);
}
console.log('Done. Commit data/wb/ to publish the refreshed record.');
