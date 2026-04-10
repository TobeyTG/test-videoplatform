"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "./keys";
import type { MediaItem } from "@/lib/mediacms";

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MediaItem[];
}

export function searchOptions(query: string) {
  return queryOptions({
    queryKey: queryKeys.search.results(query),
    queryFn: async (): Promise<SearchResponse> => {
      const { data, error } = await api.GET("/search", {
        params: { query: { q: query } as never },
      });
      if (error) throw new Error("Search failed");
      return data as unknown as SearchResponse;
    },
    enabled: query.trim().length > 0,
    staleTime: 30_000,
  });
}

export function useSearch(query: string) {
  return useQuery(searchOptions(query));
}
