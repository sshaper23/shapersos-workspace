"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  icon: LucideIcon;
  href: string;
  label: string;
}

export function SidebarNavItem({ icon: Icon, href, label }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group",
        isActive
          ? "bg-[#71a474]/20 text-[#71a474]"
          : "text-[hsl(0_0%_100%/0.4)] hover:text-[hsl(0_0%_100%/0.8)] hover:bg-[hsl(0_0%_100%/0.08)]"
      )}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-[#71a474]/10" />
      )}
      <Icon className="relative z-10 h-5 w-5" />
      <span className="absolute left-14 z-50 hidden rounded-md bg-[#0a1e55] px-2 py-1 text-xs font-medium text-white shadow-lg border border-[hsl(0_0%_100%/0.1)] group-hover:block whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
}
