"use client";

import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "./keys";

export function mediaListOptions(params?: { page?: number }) {
  return queryOptions({
    queryKey: queryKeys.media.list(params),
    queryFn: async () => {
      const { data, error } = await api.GET("/media");
      if (error) throw new Error("Failed to fetch media list");
      return data;
    },
  });
}

export function mediaDetailOptions(token: string) {
  return queryOptions({
    queryKey: queryKeys.media.detail(token),
    queryFn: async () => {
      const { data, error } = await api.GET("/media/{friendly_token}", {
        params: { path: { friendly_token: token } },
      });
      if (error) throw new Error("Failed to fetch media detail");
      return data;
    },
  });
}

export function mediaCommentsOptions(token: string) {
  return queryOptions({
    queryKey: queryKeys.media.comments(token),
    queryFn: async () => {
      const { data, error } = await api.GET("/media/{friendly_token}/comments", {
        params: { path: { friendly_token: token } },
      });
      if (error) throw new Error("Failed to fetch comments");
      return data;
    },
  });
}

export function useMediaList(params?: { page?: number }) {
  return useQuery(mediaListOptions(params));
}

export function useMediaDetail(token: string) {
  return useQuery(mediaDetailOptions(token));
}

export function useMediaComments(token: string) {
  return useQuery(mediaCommentsOptions(token));
}

export function useMediaAction(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: "like" | "dislike" | "report") => {
      const { data, error } = await api.POST("/media/{friendly_token}/actions", {
        params: { path: { friendly_token: token } },
        body: { action } as never,
      });
      if (error) throw new Error("Failed to perform action");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(token) });
    },
  });
}

export function usePostComment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      const { data, error } = await api.POST("/media/{friendly_token}/comments", {
        params: { path: { friendly_token: token } },
        body: { text } as never,
      });
      if (error) throw new Error("Failed to post comment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.media.comments(token),
      });
    },
  });
}
