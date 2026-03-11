import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { mentors } from "@/data/mentors";
import { MessageCircle } from "lucide-react";

export default function MentorsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Mentors" subtitle="Get expert AI-driven advice to grow your business">
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#71a474] text-white text-sm font-medium hover:bg-[#71a474]/90 transition-colors">
          How to use
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map((mentor) => (
          <Link
            key={mentor.slug}
            href={`/mentors/${mentor.slug}`}
            className="group flex flex-col rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-6 transition-all hover:border-[hsl(0_0%_100%/0.12)] hover:bg-[hsl(0_0%_100%/0.04)]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(0_0%_100%/0.06)]">
                <span className="text-2xl">{mentor.emoji}</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{mentor.name}</h3>
                <p className="text-xs text-muted-foreground">{mentor.speciality}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {mentor.description}
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-medium text-[#71a474]">
              <MessageCircle className="h-3 w-3" />
              Start Chatting
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
