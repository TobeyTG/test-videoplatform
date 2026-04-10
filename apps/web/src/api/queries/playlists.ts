"use client";

import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "./keys";

// ---------------------------------------------------------------------------
// Query Options
// ---------------------------------------------------------------------------

export function playlistListOptions(params?: { page?: number }) {
  return queryOptions({
    queryKey: queryKeys.playlists.list(params),
    queryFn: async () => {
      const { data, error } = await api.GET("/playlists");
      if (error) throw new Error("Failed to fetch playlists");
      return data;
    },
  });
}

export function playlistDetailOptions(token: string) {
  return queryOptions({
    queryKey: queryKeys.playlists.detail(token),
    queryFn: async () => {
      const { data, error } = await api.GET("/playlists/{friendly_token}", {
        params: { path: { friendly_token: token } },
      });
      if (error) throw new Error("Failed to fetch playlist");
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function usePlaylistList(params?: { page?: number }) {
  return useQuery(playlistListOptions(params));
}

export function usePlaylistDetail(token: string) {
  return useQuery(playlistDetailOptions(token));
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: { title: string; description?: string }) => {
      const { data, error } = await api.POST("/playlists", {
        body: body as never,
      });
      if (error) throw new Error("Failed to create playlist");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { error } = await api.DELETE("/playlists/{friendly_token}", {
        params: { path: { friendly_token: token } },
      });
      if (error) throw new Error("Failed to delete playlist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playlists.all });
    },
  });
}
