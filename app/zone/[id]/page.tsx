import { ZoneDetail } from "@/components/parking/zone-detail";
export default async function ZoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ZoneDetail zoneId={id.toUpperCase()} />;
}
