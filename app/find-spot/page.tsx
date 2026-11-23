import { FindSpot } from "./find-spot";

export default async function FindSpotPage({ searchParams }: { searchParams: Promise<{ zone?: string | string[] }> }) {
  const { zone } = await searchParams;
  const initialZone = typeof zone === "string" ? zone : "E1";
  return <FindSpot key={initialZone} initialZone={initialZone} />;
}
