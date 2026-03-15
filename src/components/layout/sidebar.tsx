"use client";

import Image from "next/image";
import { navItems, settingsItem } from "@/data/nav-items";
import { SidebarNavItem } from "./sidebar-nav-item";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.04)] py-4 backdrop-blur-xl">
      <div className="mb-4 flex h-8 w-8 items-center justify-center">
        <Image src="/logo.svg" alt=".shapers" width={32} height={32} className="rounded-md" />
      </div>

      <nav className="flex flex-1 flex-col items-center space-y-1">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href + item.label}
            icon={item.icon}
            href={item.href}
            label={item.label}
            external={item.external}
            proOnly={item.proOnly}
          />
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <SidebarNavItem
          icon={settingsItem.icon}
          href={settingsItem.href}
          label={settingsItem.label}
        />
      </div>
    </aside>
  );
}
