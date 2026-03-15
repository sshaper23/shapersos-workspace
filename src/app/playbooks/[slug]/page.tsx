import { flows } from "@/data/flows";
import PlaybookPageClient from "./client";

export function generateStaticParams() {
  return flows.map((f) => ({ slug: f.slug }));
}

export default function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PlaybookPageClient params={params} />;
}
