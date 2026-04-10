import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Client-side API client.
 * Routes through Next.js rewrite proxy (/api/cms -> MediaCMS /api/v1).
 */
export const api = createClient<paths>({
  baseUrl: "/api/cms",
});
