/**
 * Query key factory.
 * Structured keys enable granular cache invalidation.
 *
 * Usage:
 *   queryKeys.media.all        → ["media"]
 *   queryKeys.media.list(opts) → ["media", "list", opts]
 *   queryKeys.media.detail(t)  → ["media", "detail", t]
 */
export const queryKeys = {
  media: {
    all: ["media"] as const,
    lists: () => [...queryKeys.media.all, "list"] as const,
    list: (params?: { page?: number }) =>
      [...queryKeys.media.lists(), params] as const,
    details: () => [...queryKeys.media.all, "detail"] as const,
    detail: (token: string) => [...queryKeys.media.details(), token] as const,
    comments: (token: string) =>
      [...queryKeys.media.detail(token), "comments"] as const,
  },
  playlists: {
    all: ["playlists"] as const,
    lists: () => [...queryKeys.playlists.all, "list"] as const,
    list: (params?: { page?: number }) =>
      [...queryKeys.playlists.lists(), params] as const,
    details: () => [...queryKeys.playlists.all, "detail"] as const,
    detail: (token: string) =>
      [...queryKeys.playlists.details(), token] as const,
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: { page?: number }) =>
      [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (username: string) =>
      [...queryKeys.users.details(), username] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  tags: {
    all: ["tags"] as const,
  },
  search: {
    all: ["search"] as const,
    results: (query: string) => [...queryKeys.search.all, query] as const,
  },
} as const;
