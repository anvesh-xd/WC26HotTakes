// Maps football-data.org team names to ISO 3166-1 alpha-2 codes so we can
// render emoji flags. Covers likely World Cup 2026 qualifiers; falls back to a
// neutral marker for anything unmapped.

const NAME_TO_ISO: Record<string, string> = {
  Algeria: "DZ",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  "Bosnia-Herzegovina": "BA",
  "Bosnia and Herzegovina": "BA",
  Brazil: "BR",
  Cameroon: "CM",
  Canada: "CA",
  "Cape Verde": "CV",
  "Cape Verde Islands": "CV",
  Chile: "CL",
  Colombia: "CO",
  "Congo DR": "CD",
  "DR Congo": "CD",
  "Costa Rica": "CR",
  Croatia: "HR",
  Denmark: "DK",
  Ecuador: "EC",
  Egypt: "EG",
  France: "FR",
  Germany: "DE",
  Ghana: "GH",
  Iran: "IR",
  "IR Iran": "IR",
  Italy: "IT",
  "Ivory Coast": "CI",
  "Côte d'Ivoire": "CI",
  Japan: "JP",
  Mexico: "MX",
  Morocco: "MA",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Nigeria: "NG",
  Norway: "NO",
  Panama: "PA",
  Paraguay: "PY",
  Peru: "PE",
  Poland: "PL",
  Portugal: "PT",
  Qatar: "QA",
  "Republic of Korea": "KR",
  "South Korea": "KR",
  "Korea Republic": "KR",
  "Saudi Arabia": "SA",
  Senegal: "SN",
  Serbia: "RS",
  "South Africa": "ZA",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Tunisia: "TN",
  Turkey: "TR",
  "Türkiye": "TR",
  Ukraine: "UA",
  Uruguay: "UY",
  USA: "US",
  "United States": "US",
  Wales: "__WALES",
  England: "__ENGLAND",
  Scotland: "__SCOTLAND",
};

const SUBDIVISION_FLAGS: Record<string, string> = {
  __ENGLAND: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  __SCOTLAND: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  __WALES: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

function isoToEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0))
    );
}

export function getFlag(teamName: string | null | undefined): string {
  if (!teamName) return "⚽";
  const code = NAME_TO_ISO[teamName.trim()];
  if (!code) return "⚽";
  if (code in SUBDIVISION_FLAGS) return SUBDIVISION_FLAGS[code];
  return isoToEmoji(code);
}
