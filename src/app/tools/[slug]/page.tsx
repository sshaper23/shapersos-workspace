import { tools } from "@/data/tools";
import ToolPageClient from "./client";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ToolPageClient params={params} />;
}
