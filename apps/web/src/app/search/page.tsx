"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { SearchX, Sparkles } from "lucide-react";
import { useSearch } from "@/api/queries/search";
import VideoCard from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

function SearchResults() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const { data, isLoading, isFetching, isError } = useSearch(query);

  const results = data?.results ?? [];
  const hasQuery = query.length > 0;

  return (
    <main className="mx-auto max-w-[1800px] px-4 pb-20 pt-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          Search
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {hasQuery ? (
            <>
              Results for{" "}
              <span className="bg-gradient-to-r from-brand to-orange-400 bg-clip-text text-transparent">
                &ldquo;{query}&rdquo;
              </span>
            </>
          ) : (
            "Start searching"
          )}
        </h1>
        {hasQuery && !isLoading && (
          <p className="mt-1 text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
            {isFetching && " · refreshing..."}
          </p>
        )}
      </motion.div>

      {!hasQuery ? (
        <EmptyHint />
      ) : isLoading ? (
        <SearchGridSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
          Something went wrong fetching results. Try again.
        </div>
      ) : results.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {results.map((item, idx) => (
            <motion.div
              key={item.friendly_token ?? idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.4), duration: 0.3 }}
            >
              <VideoCard item={item} compact />
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}

function EmptyHint() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
      <Sparkles className="h-10 w-10 text-brand/60" />
      <p className="text-sm text-muted-foreground">Type something in the search bar to find videos.</p>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
      <SearchX className="h-10 w-10 text-muted-foreground/60" />
      <p className="text-base font-medium text-foreground">No results for &ldquo;{query}&rdquo;</p>
      <p className="max-w-sm text-sm text-muted-foreground">Try a different keyword, or check the spelling.</p>
    </div>
  );
}

function SearchGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2.5">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-3.5 w-[85%]" />
          <Skeleton className="h-3 w-[45%]" />
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchGridSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
