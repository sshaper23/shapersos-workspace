"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { useApp } from "@/context/app-context";
import {
  Check as CheckIcon,
  Send,
  Loader2,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TASK_TYPES = [
  "Administration",
  "Funnels",
  "Technical",
  "Creative Asset Launch",
  "Brief",
  "Systems",
  "Offer",
  "Approval",
  "Research",
  "Report",
  "GTM",
  "Content",
  "Creative Development",
  "Audit",
  "Social Media",
  "Video",
];

const URGENCY_OPTIONS = [
  "Highly urgent (needs to happen today)",
  "Moderate urgency (In the next 48-72 hours)",
  "Low urgency (when it can be done)",
];

export default function TaskRequestPage() {
  const { state } = useApp();
  const businessName = state.northStarData?.company || "";

  const [taskName, setTaskName] = useState("");
  const [bizName, setBizName] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [resources, setResources] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill business name from North Star context
  useEffect(() => {
    if (businessName) {
      setBizName(businessName);
    }
  }, [businessName]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async () => {
    if (!taskName.trim()) {
      setError("Task name is required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/notion/task-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName,
          businessName: bizName,
          description,
          taskTypes: selectedTypes,
          urgency,
          dueDate,
          resources,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Task Request Submitted
            </h2>
            <p className="text-muted-foreground mb-8">
              Your task has been submitted to the Shapers team. We&apos;ll get
              on it based on the urgency level you selected.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <Link
                href="/"
                className="px-5 py-2 rounded-xl bg-[hsl(0_0%_100%/0.08)] text-foreground hover:bg-[hsl(0_0%_100%/0.12)] transition-colors text-sm flex items-center gap-2"
              >
                <Home className="h-3.5 w-3.5" />
                Return to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setTaskName("");
                  setSelectedTypes([]);
                  setDescription("");
                  setUrgency("");
                  setDueDate("");
                  setResources("");
                  setError("");
                }}
                className="px-5 py-2 rounded-xl bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90 transition-colors text-sm"
              >
                Submit Another Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="Task Request"
          subtitle="Submit a task or request to the Shapers team"
        />

        <div className="space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Task Name <span className="text-[#0ea5e9]">*</span>
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Set up email automation for new leads"
              className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
            />
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="Your business name"
              className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm"
            />
          </div>

          {/* Task Type (multi-select checkboxes) */}
          <div>
            <label className="block text-sm font-medium mb-2">Task Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TASK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-xs font-medium text-left transition-colors",
                    selectedTypes.includes(type)
                      ? "bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-[#0ea5e9]"
                      : "bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)] hover:text-foreground"
                  )}
                >
                  {selectedTypes.includes(type) && (
                    <CheckIcon className="inline h-3 w-3 mr-1.5 -mt-0.5" />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe the task in detail
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done? Include any specific requirements, context, or reference material."
              rows={5}
              className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y text-sm"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium mb-2">
              How urgent is this request?
            </label>
            <div className="space-y-2">
              {URGENCY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUrgency(option)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors",
                    urgency === option
                      ? "bg-[#0ea5e9]/15 border-[#0ea5e9]/40 text-[#0ea5e9]"
                      : "bg-[hsl(0_0%_100%/0.04)] border-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:bg-[hsl(0_0%_100%/0.06)] hover:text-foreground"
                  )}
                >
                  {urgency === option && (
                    <CheckIcon className="inline h-3.5 w-3.5 mr-2 -mt-0.5" />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-10 px-4 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors text-sm [color-scheme:dark]"
            />
          </div>

          {/* Resources / Links */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Resources / Links
            </label>
            <textarea
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="Paste any relevant links, references, or notes here."
              rows={3}
              className="w-full px-4 py-3 bg-[hsl(0_0%_100%/0.04)] border border-[hsl(0_0%_100%/0.08)] rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-[#0ea5e9]/50 transition-colors resize-y text-sm"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 pb-8">
            <button
              onClick={handleSubmit}
              disabled={submitting || !taskName.trim()}
              className={cn(
                "w-full py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2",
                taskName.trim()
                  ? "bg-[#0ea5e9] text-white hover:bg-[#0ea5e9]/90"
                  : "bg-[hsl(0_0%_100%/0.08)] text-muted-foreground cursor-not-allowed"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Task Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
