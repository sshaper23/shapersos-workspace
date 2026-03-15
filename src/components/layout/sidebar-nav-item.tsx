"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ExternalLink, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTier } from "@/hooks/use-tier";

interface SidebarNavItemProps {
  icon: LucideIcon;
  href: string;
  label: string;
  external?: boolean;
  proOnly?: boolean;
}

export function SidebarNavItem({ icon: Icon, href, label, external, proOnly }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { isPro } = useTier();
  const isLocked = proOnly && !isPro;
  const isActive =
    !external &&
    (href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/"));

  const classes = cn(
    "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group",
    isActive
      ? "bg-[#0ea5e9]/20 text-[#0ea5e9]"
      : isLocked
        ? "text-[hsl(0_0%_100%/0.25)] hover:text-[hsl(0_0%_100%/0.5)] hover:bg-[hsl(0_0%_100%/0.04)]"
        : "text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.08)]"
  );

  const inner = (
    <>
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-[#0ea5e9]/10" />
      )}
      <Icon className="relative z-10 h-5 w-5" />
      {isLocked && (
        <Lock className="absolute -top-0.5 -right-0.5 z-20 h-2.5 w-2.5 text-[#0ea5e9]" />
      )}
      <span className="absolute left-14 z-50 hidden rounded-md bg-[#0c1024] px-2 py-1 text-xs font-medium text-white shadow-lg border border-[hsl(0_0%_100%/0.1)] group-hover:flex items-center gap-1.5 whitespace-nowrap">
        {label}
        {isLocked && (
          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-[#0ea5e9]/15 text-[#0ea5e9]">
            PRO
          </span>
        )}
        {external && <ExternalLink className="h-3 w-3 opacity-50" />}
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={label} className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} title={label} className={classes}>
      {inner}
    </Link>
  );
}
