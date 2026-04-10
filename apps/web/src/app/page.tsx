import Link from "next/link";
import { Globe, Play } from "lucide-react";
import { getMedia } from "@/lib/mediacms";
import Hero from "@/components/hero";
import VideoRow from "@/components/video-row";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { results: media } = await getMedia();

  if (media.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-brand/20 blur-3xl" />
          <Globe className="h-20 w-20 text-brand/70" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Welcome to Sapana
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
          No media yet. Upload videos at the{" "}
          <a
            href="http://localhost"
            target="_blank"
            rel="noreferrer"
            className="text-brand underline underline-offset-4 hover:text-brand/80"
          >
            MediaCMS admin panel
          </a>{" "}
          and they&apos;ll appear here.
        </p>
        <Link
          href="http://localhost"
          target="_blank"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105"
        >
          <Play className="h-4 w-4 fill-current" />
          Open MediaCMS
        </Link>
      </main>
    );
  }

  const featured = media[0];
  const recentlyAdded = media;
  const trending = [...media].reverse();
  const staffPicks = [...media].sort(
    (a, b) => (b.views ?? 0) - (a.views ?? 0)
  );

  return (
    <main className="-mt-16">
      <Hero item={featured} />

      <div className="relative z-10 -mt-16 space-y-4 pb-12 md:-mt-20 md:space-y-6">
        <VideoRow title="Recently Added" items={recentlyAdded} />
        {media.length > 1 && (
          <VideoRow title="Trending Now" items={trending} />
        )}
        {media.length > 2 && (
          <VideoRow title="Most Watched" items={staffPicks} />
        )}
      </div>
    </main>
  );
}
