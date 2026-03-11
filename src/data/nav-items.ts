import {
  LayoutDashboard,
  Hammer,
  GitBranch,
  Users,
  Clock,
  Compass,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types/nav";

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, href: "/", label: "Home" },
  { icon: Compass, href: "/north-star", label: "North Star" },
  { icon: Hammer, href: "/tools", label: "Tools" },
  { icon: GitBranch, href: "/workflows", label: "Workflows" },
  { icon: Users, href: "/mentors", label: "Mentors" },
  { icon: Clock, href: "/history", label: "Usage History" },
];

export const settingsItem: NavItem = {
  icon: Settings,
  href: "/settings",
  label: "Settings",
};
