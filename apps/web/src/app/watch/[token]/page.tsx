import { notFound } from "next/navigation";
import { getMediaByToken, getMedia, resolveMediaUrl } from "@/lib/mediacms";
import Player from "@/components/player";
import VideoRow from "@/components/video-row";
import { Eye, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

interface HlsInfo {
  master_file?: string;
}

interface Props {
  params: Promise<{ token: string }>;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0)
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function WatchPage({ params }: Props) {
  const { token } = await params;
  const [media, { results: allMedia }] = await Promise.all([
    getMediaByToken(token),
    getMedia(),
  ]);

  if (!media) return notFound();

  const hlsInfo = media.hls_info as unknown as HlsInfo | undefined;
  const hlsSrc = hlsInfo?.master_file
    ? resolveMediaUrl(hlsInfo.master_file)
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

  const related = allMedia.filter((m) => m.friendly_token !== token);

  return (
    <main className="mx-auto max-w-[1800px]">
      {/* Video player — edge-to-edge on mobile, contained on desktop */}
      <div className="w-full bg-black">
        <div className="mx-auto aspect-video max-w-[1400px]">
          <Player src={videoSrc} poster={poster} />
        </div>
      </div>

      {/* Video metadata */}
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <h1 className="text-xl font-bold text-foreground md:text-3xl">
          {media.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {media.views ?? 0} views
          </span>
          <Separator orientation="vertical" className="h-4 bg-border/60" />
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {media.add_date
              ? new Date(media.add_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown date"}
          </span>
          {(media.duration ?? 0) > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="h-4 bg-border/60"
              />
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(media.duration ?? 0)}
              </span>
            </>
          )}
          {media.state && (
            <Badge
              variant="secondary"
              className="bg-brand/15 text-brand border-brand/20"
            >
              {media.state}
            </Badge>
          )}
        </div>

        {media.description && (
          <>
            <Separator className="my-5 bg-border/50" />
            <p className="max-w-3xl leading-relaxed text-foreground/80">
              {media.description}
            </p>
          </>
        )}
      </div>

      {/* Related videos row */}
      {related.length > 0 && (
        <div className="mt-4 pb-10">
          <VideoRow title="More to Watch" items={related} />
        </div>
      )}
    </main>
  );
}
