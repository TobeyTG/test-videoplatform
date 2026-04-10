import Link from "next/link";
import { getMedia, resolveMediaUrl } from "@/lib/mediacms";

export const dynamic = "force-dynamic";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function Home() {
  const { results: media } = await getMedia();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>SAPANA</h1>

      {media.length === 0 ? (
        <section>
          <p>No media yet.</p>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Upload videos at{" "}
            <a href="http://localhost" target="_blank" rel="noreferrer">
              MediaCMS admin
            </a>{" "}
            to see them here.
          </p>
        </section>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {media.map((item) => (
            <Link
              key={item.friendly_token}
              href={`/watch/${item.friendly_token}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article>
                <img
                  src={resolveMediaUrl(item.thumbnail_url)}
                  alt={item.title}
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    borderRadius: 8,
                    background: "#111",
                  }}
                />
                <h2 style={{ fontSize: "1rem", margin: "0.5rem 0 0.25rem" }}>
                  {item.title}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#888", margin: 0 }}>
                  {item.views} views · {formatDuration(item.duration)}
                </p>
              </article>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
