"use client";

import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "./keys";

// ---------------------------------------------------------------------------
// Query Options
// ---------------------------------------------------------------------------

export function whoamiOptions() {
  return queryOptions({
    queryKey: queryKeys.users.me(),
    queryFn: async () => {
      const { data, error } = await api.GET("/whoami");
      if (error) throw new Error("Failed to fetch current user");
      return data;
    },
  });
}

export function userDetailOptions(username: string) {
  return queryOptions({
    queryKey: queryKeys.users.detail(username),
    queryFn: async () => {
      const { data, error } = await api.GET("/users/{username}", {
        params: { path: { username } },
      });
      if (error) throw new Error("Failed to fetch user");
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useCurrentUser() {
  return useQuery(whoamiOptions());
}

export function useUserDetail(username: string) {
  return useQuery(userDetailOptions(username));
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: {
      username?: string;
      email?: string;
      password: string;
    }) => {
      const { data, error } = await api.POST("/login", {
        body: credentials as never,
      });
      if (error) throw new Error("Login failed");
      return data;
    },
  });
}
