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

/**
 * Convert a YouTube URL (watch, short, embed) into an embed URL.
 * Returns the original URL if not a recognised YouTube format.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}?rel=0&autoplay=1`;
    }
    // youtu.be/ID
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}?rel=0&autoplay=1`;
    }
    // already an embed URL
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return url;
    }
    // Loom
    if (u.hostname.includes("loom.com") && u.pathname.includes("/share/")) {
      return u.href.replace("/share/", "/embed/");
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export function VideoWalkthroughBanner({ section }: VideoWalkthroughBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // hidden by default until checked
  const [showModal, setShowModal] = useState(false);
  const video = getWalkthroughVideo(section);

  useEffect(() => {
    if (!video) return;
    const dismissed = getDismissed();
    setIsDismissed(dismissed.includes(section));
  }, [section, video]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [showModal]);

  // Don't render if no video URL configured or dismissed
  if (!video || isDismissed) return null;

  const embedUrl = toEmbedUrl(video.url);
  const canEmbed = !!embedUrl;

  const handlePlay = () => {
    if (canEmbed) {
      setShowModal(true);
    } else {
      window.open(video.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDismiss = () => {
    dismiss(section);
    setIsDismissed(true);
  };

  return (
    <>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 mb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handlePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
            >
              <Play className="h-4 w-4 text-emerald-400 ml-0.5" />
            </button>
            <div className="min-w-0">
              <button
                onClick={handlePlay}
                className="text-sm font-medium text-emerald-400 hover:underline text-left"
              >
                {video.title}
                <span className="ml-1.5 text-[10px] font-normal text-emerald-400/60">
                  {video.duration}
                </span>
              </button>
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

      {/* Video Modal */}
      {showModal && embedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
              Close
            </button>
            {/* 16:9 responsive iframe */}
            <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
