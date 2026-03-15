import {
  Target,
  Search,
  BarChart3,
  TrendingUp,
  FileText,
  PenTool,
  Megaphone,
  Lightbulb,
  Layers,
  Zap,
  Video,
  Mail,
  Send,
  Globe,
  Shield,
  Users,
  Phone,
  MessageSquare,
  BookOpen,
  Mic,
  Camera,
  Calendar,
  Tag,
  HelpCircle,
  ScrollText,
  Lock,
  DollarSign,
  Palette,
  User,
  Smartphone,
  Newspaper,
  Presentation,
  Crosshair,
  Radio,
  Volume2,
  Waypoints,
  FlaskConical,
  Brain,
  HeartHandshake,
  Sparkles,
  Frame,
  MonitorPlay,
  Grid3X3,
  Route,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  // Market Research
  target: Target,
  search: Search,
  "bar-chart": BarChart3,
  "trending-up": TrendingUp,

  // Copywriting & Content
  "file-text": FileText,
  "pen-tool": PenTool,
  megaphone: Megaphone,
  lightbulb: Lightbulb,
  layers: Layers,
  zap: Zap,
  newspaper: Newspaper,
  camera: Camera,

  // Video & Media
  video: Video,
  "monitor-play": MonitorPlay,
  mic: Mic,

  // Email & Messaging
  mail: Mail,
  send: Send,
  "message-square": MessageSquare,
  smartphone: Smartphone,

  // Sales
  phone: Phone,
  users: Users,
  "book-open": BookOpen,
  presentation: Presentation,
  brain: Brain,
  "heart-handshake": HeartHandshake,
  sparkles: Sparkles,
  frame: Frame,

  // Website & SEO
  globe: Globe,
  tag: Tag,
  "help-circle": HelpCircle,

  // Legal
  "scroll-text": ScrollText,
  lock: Lock,
  "dollar-sign": DollarSign,
  shield: Shield,

  // Misc
  palette: Palette,
  user: User,
  calendar: Calendar,

  // Messaging Matrix
  "grid-3x3": Grid3X3,

  // Sales Mechanism & Revenue Engine
  route: Route,

  // Playbook-specific
  crosshair: Crosshair,
  radio: Radio,
  "volume-2": Volume2,
  waypoints: Waypoints,
  "flask-conical": FlaskConical,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Target;
}
