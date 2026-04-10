import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaByToken, resolveMediaUrl } from "@/lib/mediacms";
import Player from "@/components/player";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function WatchPage({ params }: Props) {
  const { token } = await params;
  const media = await getMediaByToken(token);

  if (!media) return notFound();

  const hlsSrc = media.hls_info?.master_file
    ? resolveMediaUrl(media.hls_info.master_file)
    : null;

  const mp4Src = media.original_media_url
    ? resolveMediaUrl(media.original_media_url)
    : null;

  const videoSrc = hlsSrc || mp4Src;
  if (!videoSrc) return notFound();

  const poster = media.poster_url
    ? resolveMediaUrl(media.poster_url)
    : media.thumbnail_url
      ? resolveMediaUrl(media.thumbnail_url)
      : undefined;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <Link href="/" style={{ color: "#888", fontSize: "0.9rem" }}>
        ← Back
      </Link>

      <div style={{ marginTop: "1rem" }}>
        <Player src={videoSrc} poster={poster} />
      </div>

      <h1 style={{ fontSize: "1.5rem", marginTop: "1rem" }}>{media.title}</h1>

      <p style={{ color: "#888", fontSize: "0.9rem" }}>
        {media.views} views · {new Date(media.add_date).toLocaleDateString()}
      </p>

      {media.description && (
        <p style={{ marginTop: "1rem", lineHeight: 1.6 }}>
          {media.description}
        </p>
      )}
    </main>
  );
}
