import { apiServer } from "@/api/server";
import type { components } from "@/api/schema";

const MEDIACMS_URL = process.env.MEDIACMS_URL || "http://localhost";

export type MediaItem = components["schemas"]["Media"];
export type SingleMediaItem = components["schemas"]["SingleMedia"];

interface MediaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MediaItem[];
}

export async function getMedia(): Promise<MediaListResponse> {
  try {
    const { data, error } = await apiServer.GET("/media");

    if (error) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    return data as unknown as MediaListResponse;
  } catch {
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export async function getMediaByToken(
  token: string,
): Promise<SingleMediaItem | null> {
  try {
    const { data, error } = await apiServer.GET("/media/{friendly_token}", {
      params: { path: { friendly_token: token } },
    });

    if (error) return null;

    return data as SingleMediaItem;
  } catch {
    return null;
  }
}

export function resolveMediaUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${MEDIACMS_URL}${path}`;
}
