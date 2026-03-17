"use client";

import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { getWalkthroughVideo } from "@/data/walkthrough-videos";

interface VideoWalkthroughBannerProps {
  /** Section key matching walkthroughVideos data */
  section: string;
}

const DISMISSED_KEY = "shapers-os-dismissed-walkthroughs";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function dismiss(section: string) {
  const dismissed = getDismissed();
  if (!dismissed.includes(section)) {
    dismissed.push(section);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }
}

export function VideoWalkthroughBanner({ section }: VideoWalkthroughBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // hidden by default until checked
  const video = getWalkthroughVideo(section);

  useEffect(() => {
    if (!video) return;
    const dismissed = getDismissed();
    setIsDismissed(dismissed.includes(section));
  }, [section, video]);

  // Don't render if no video URL configured or dismissed
  if (!video || isDismissed) return null;

  const handleDismiss = () => {
    dismiss(section);
    setIsDismissed(true);
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
          >
            <Play className="h-4 w-4 text-emerald-400 ml-0.5" />
          </a>
          <div className="min-w-0">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-400 hover:underline"
            >
              {video.title}
              <span className="ml-1.5 text-[10px] font-normal text-emerald-400/60">
                {video.duration}
              </span>
            </a>
            <p className="text-xs text-muted-foreground truncate">
              {video.description}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-[hsl(0_0%_100%/0.06)] transition-colors"
          aria-label="Dismiss walkthrough"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
