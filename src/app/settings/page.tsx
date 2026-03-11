import { PageHeader } from "@/components/shared/page-header";
import { Lock, User, Key, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {/* Auth Gate */}
      <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-8 text-center mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(0_0%_100%/0.06)] mx-auto mb-4">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Sign in required</h2>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Authentication will be available soon. Settings and preferences will be tied to your account.
        </p>
        <button className="px-6 py-2.5 rounded-lg bg-[#71a474] text-white text-sm font-medium hover:bg-[#71a474]/90 transition-colors">
          Coming Soon
        </button>
      </div>

      {/* Settings Preview (disabled) */}
      <div className="space-y-4 opacity-50 pointer-events-none">
        {[
          { icon: User, label: "Profile", desc: "Manage your name, email, and avatar" },
          { icon: Key, label: "API Keys", desc: "Configure your Anthropic API key" },
          { icon: Bell, label: "Notifications", desc: "Email and in-app notification preferences" },
          { icon: Palette, label: "Appearance", desc: "Theme, font size, and display settings" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(0_0%_100%/0.06)]">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-medium">{item.label}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
