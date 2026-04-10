import createClient from "openapi-fetch";
import type { paths } from "./schema";

const MEDIACMS_URL = process.env.MEDIACMS_URL || "http://localhost";

/**
 * Server-side API client.
 * Fetches directly from MediaCMS without going through the proxy.
 * Use this in Server Components and Route Handlers.
 */
export const apiServer = createClient<paths>({
  baseUrl: `${MEDIACMS_URL}/api/v1`,
});
