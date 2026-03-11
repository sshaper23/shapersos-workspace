import Link from "next/link";
import { ArrowRight, Compass, Hammer } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ToolCard } from "@/components/tools/tool-card";
import { tools } from "@/data/tools";

const marketingCategories = [
  "market-research",
  "copywriting",
  "concept-creation",
  "ads",
  "content",
  "emails",
  "funnels",
  "webinar",
  "website",
];

const salesCategories = ["sales-collateral", "sales"];

export default function HomePage() {
  const marketingTools = tools.filter((t) =>
    marketingCategories.includes(t.category)
  );
  const salesTools = tools.filter((t) =>
    salesCategories.includes(t.category)
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Home"
        subtitle="Welcome to the AI-powered platform"
      />

      {/* Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link
          href="/north-star"
          className="group relative overflow-hidden rounded-xl border border-[#71a474]/30 bg-[#71a474]/5 p-6 transition-all hover:border-[#71a474]/50 hover:bg-[#71a474]/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#71a474]/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#71a474]/20">
                <Compass className="h-5 w-5 text-[#71a474]" />
              </div>
              <h2 className="text-lg font-semibold text-[#71a474]">
                North Star Document
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your business profile to unlock AI-powered outputs
              tailored to your business.
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-[#71a474]">
              Get Started <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>

        <Link
          href="/tools"
          className="group relative overflow-hidden rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6 transition-all hover:border-[hsl(0_0%_100%/0.15)] hover:bg-[hsl(0_0%_100%/0.04)]"
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.08)]">
                <Hammer className="h-5 w-5 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Explore Tools</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Market research, copywriting, concept creation, sales collateral
              and more.
            </p>
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
              Browse All Tools <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </Link>
      </div>

      {/* Marketing Resources */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Marketing Resources</h2>
          <Link
            href="/tools"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {marketingTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>

      {/* Sales Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Sales Resources</h2>
          <Link
            href="/tools"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {salesTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
