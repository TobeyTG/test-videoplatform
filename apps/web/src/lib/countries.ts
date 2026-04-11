import type { MediaItem } from "@/lib/mediacms";

export interface Country {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

export const COUNTRIES: readonly Country[] = [
  { code: "np", name: "Nepal", lat: 28.39, lon: 84.12 },
  { code: "us", name: "United States", lat: 38.9, lon: -77.04 },
  { code: "br", name: "Brazil", lat: -15.79, lon: -47.88 },
  { code: "gb", name: "United Kingdom", lat: 51.51, lon: -0.13 },
  { code: "de", name: "Germany", lat: 52.52, lon: 13.4 },
  { code: "fr", name: "France", lat: 48.86, lon: 2.35 },
  { code: "is", name: "Iceland", lat: 64.14, lon: -21.94 },
  { code: "za", name: "South Africa", lat: -33.92, lon: 18.42 },
  { code: "jp", name: "Japan", lat: 35.68, lon: 139.69 },
  { code: "in", name: "India", lat: 28.61, lon: 77.21 },
  { code: "au", name: "Australia", lat: -33.87, lon: 151.21 },
  { code: "mx", name: "Mexico", lat: 19.43, lon: -99.13 },
] as const;

export function latLonToVec3(
  lat: number,
  lon: number,
  radius = 1,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// djb2 hash — must be stable across server/client so SSR and hydration agree
// on which country a given media item lands in.
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// TODO: swap for a real tag lookup once MediaCMS tags uploads with a region.
export function countryForMedia(item: MediaItem): Country {
  const key = item.friendly_token ?? item.title ?? "";
  const idx = hashString(key) % COUNTRIES.length;
  return COUNTRIES[idx]!;
}

export interface CountryBucket {
  country: Country;
  items: MediaItem[];
}

export function groupMediaByCountry(items: MediaItem[]): CountryBucket[] {
  const buckets: CountryBucket[] = COUNTRIES.map((country) => ({
    country,
    items: [],
  }));
  const byCode = new Map(buckets.map((b) => [b.country.code, b]));
  for (const item of items) {
    const country = countryForMedia(item);
    byCode.get(country.code)!.items.push(item);
  }
  return buckets;
}
