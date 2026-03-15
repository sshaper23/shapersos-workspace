import {
  LayoutDashboard,
  Hammer,
  Play,
  Clock,
  Compass,
  Settings,
  Grid3X3,
  Palette,
  Route,
  Zap,
  Users,

  Wrench,
} from "lucide-react";
import type { NavItem } from "@/types/nav";

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, href: "/", label: "Home" },
  { icon: Zap, href: "/revenue-engine", label: "Revenue Engine" },
  { icon: Compass, href: "/north-star", label: "North Star" },
  { icon: Palette, href: "/brand-guidelines", label: "Brand Guidelines", proOnly: true },
  { icon: Route, href: "/sales-mechanism", label: "Sales Mechanism" },

  { icon: Hammer, href: "/tools", label: "Tools" },
  { icon: Grid3X3, href: "/messaging-matrix", label: "Messaging Matrix", proOnly: true },
  { icon: Play, href: "/playbooks", label: "Playbooks", proOnly: true },
  { icon: Wrench, href: "/mechanic", label: "Mechanic" },
  { icon: Clock, href: "/history", label: "Usage History" },
  {
    icon: Users,
    href: "https://login.circle.so/sign_in?request_host=revenue-mechanics.circle.so",
    label: "Community",
    external: true,
  },
];

export const settingsItem: NavItem = {
  icon: Settings,
  href: "/settings",
  label: "Settings",
};
