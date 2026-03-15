"use client";

import { useEffect, useState } from "react";

export default function SignInPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [SignInComponent, setSignInComponent] = useState<any>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (key) {
      import("@clerk/nextjs").then((mod) => {
        setSignInComponent(() => mod.SignIn);
      });
    }
  }, []);

  // No Clerk key — show fallback
  if (!SignInComponent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060918]">
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[#0a0d1f] p-8 text-center max-w-sm">
          <h2 className="text-lg font-semibold text-white mb-2">Sign In</h2>
          <p className="text-sm text-[hsl(0_0%_100%/0.5)]">
            Authentication is not configured. The platform is running in guest mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060918]">
      <SignInComponent
        routing="path"
        path="/sign-in"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#0a0d1f] border border-[hsl(0_0%_100%/0.08)] shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-[hsl(0_0%_100%/0.5)]",
            socialButtonsBlockButton:
              "border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.04)] text-white hover:bg-[hsl(0_0%_100%/0.08)]",
            socialButtonsBlockButtonText: "text-white",
            formFieldLabel: "text-[hsl(0_0%_100%/0.7)]",
            formFieldInput:
              "bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.1)] text-white placeholder:text-[hsl(0_0%_100%/0.3)]",
            formButtonPrimary:
              "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white",
            footerActionLink: "text-[#0ea5e9] hover:text-[#0ea5e9]/80",
            identityPreview: "bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.1)]",
            identityPreviewText: "text-white",
            identityPreviewEditButton: "text-[#0ea5e9]",
            formFieldAction: "text-[#0ea5e9]",
            otpCodeFieldInput:
              "bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.1)] text-white",
            dividerLine: "bg-[hsl(0_0%_100%/0.08)]",
            dividerText: "text-[hsl(0_0%_100%/0.4)]",
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}
