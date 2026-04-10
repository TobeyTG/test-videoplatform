const MEDIACMS_URL = process.env.MEDIACMS_URL || "http://localhost";

export interface MediaItem {
  friendly_token: string;
  title: string;
  description: string;
  thumbnail_url: string;
  url: string;
  api_url: string;
  views: number;
  likes: number;
  dislikes: number;
  media_type: string;
  state: string;
  duration: number;
  add_date: string;
  author_name: string;
  encoding_status: string;
  original_media_url?: string;
  poster_url?: string;
  hls_info?: {
    master_file?: string;
    [key: string]: string | undefined;
  };
  encodings_info?: Record<string, Record<string, { title: string; url: string; progress: number; status: string }>>;
}

interface MediaListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MediaItem[];
}

export async function getMedia(): Promise<MediaListResponse> {
  const res = await fetch(`${MEDIACMS_URL}/api/v1/media/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return { count: 0, next: null, previous: null, results: [] };
  }

  return res.json();
}

export async function getMediaByToken(token: string): Promise<MediaItem | null> {
  const res = await fetch(`${MEDIACMS_URL}/api/v1/media/${token}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}

export function resolveMediaUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${MEDIACMS_URL}${path}`;
}
