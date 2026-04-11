import { getMedia } from "@/lib/mediacms";
import { groupMediaByCountry } from "@/lib/countries";
import GlobeScene from "@/components/globe/globe-scene";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore — SAPANA",
  description: "Spin the globe and discover films from every region.",
};

export default async function ExplorePage() {
  const { results: media } = await getMedia();
  const buckets = groupMediaByCountry(media);

  return (
    <main className="-mt-16">
      <GlobeScene buckets={buckets} />
    </main>
  );
}
