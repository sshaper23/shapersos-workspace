"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Plus,
  Save,
  Trash2,
  ClipboardPaste,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAuthState } from "@/components/shared/auth-provider";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import type { Skill } from "@/types/skills";
import { ShieldAlert } from "lucide-react";

const ADMIN_EMAILS = [
  "sam@shapersagency.com",
  "sam@theshapers.com.au",
];

interface EditorState {
  id: string;
  name: string;
  slug: string;
  category: string;
  version: string;
  status: "active" | "draft" | "deprecated";
  systemPrompt: string;
  contextRules: string;
  keyConcepts: string;
  appliesTo: string[];
  linkedPlaybooks: string;
  linkedTools: string;
  notionPageId: string | null;
}

const emptyEditor: EditorState = {
  id: "",
  name: "",
  slug: "",
  category: "Strategy",
  version: "1.0",
  status: "draft",
  systemPrompt: "",
  contextRules: "",
  keyConcepts: "",
  appliesTo: ["All Tools"],
  linkedPlaybooks: "",
  linkedTools: "",
  notionPageId: null,
};

const CATEGORIES = [
  "Paid Growth",
  "Copywriting",
  "Sales",
  "Strategy",
  "Messaging",
  "Playbook",
  "Mentor",
];

const APPLIES_TO_OPTIONS = [
  "All Tools",
  "Specific Playbooks",
  "Mentors",
  "Messaging Matrix",
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminSkillsPage() {
  const { clerkUser } = useAuthState();
  const user = clerkUser.user;
  const isLoaded = clerkUser.isLoaded;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pasteContent, setPasteContent] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  // Guest mode (static site with stub): skip auth for staging preview
  const isGuestMode = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isAdmin = isGuestMode || (isLoaded && ADMIN_EMAILS.includes(userEmail));

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notion/skills-registry");
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      }
    } catch {
      // silent fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const selectSkill = (skill: Skill) => {
    setSelectedId(skill.id);
    setEditor({
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      category: skill.category,
      version: skill.version,
      status: skill.status,
      systemPrompt: skill.systemPrompt,
      contextRules: skill.contextRules,
      keyConcepts: skill.keyConcepts.join(", "),
      appliesTo: skill.appliesTo,
      linkedPlaybooks: skill.linkedPlaybooks.join(", "),
      linkedTools: skill.linkedTools.join(", "),
      notionPageId: skill.id,
    });
    setShowPaste(false);
    setFeedback(null);
  };

  const newSkill = () => {
    setSelectedId(null);
    setEditor(emptyEditor);
    setShowPaste(false);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (!editor.name || !editor.systemPrompt) {
      setFeedback({ type: "error", message: "Name and System Prompt are required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const slug = editor.slug || toSlug(editor.name);

      // If updating, increment version
      let version = editor.version;
      if (editor.notionPageId && selectedId) {
        const parts = version.split(".");
        const minor = parseInt(parts[1] || "0", 10) + 1;
        version = `${parts[0]}.${minor}`;
      }

      const payload = {
        skill_name: editor.name,
        skill_slug: slug,
        category: editor.category,
        version,
        status: editor.status.charAt(0).toUpperCase() + editor.status.slice(1),
        system_prompt: editor.systemPrompt,
        context_rules: editor.contextRules,
        key_concepts: editor.keyConcepts,
        applies_to: editor.appliesTo,
        linked_playbooks: editor.linkedPlaybooks,
        linked_tools: editor.linkedTools,
        notionPageId: editor.notionPageId,
      };

      const res = await fetch("/api/notion/skills-registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setEditor((prev) => ({
          ...prev,
          slug: slug,
          version,
          notionPageId: data.notionPageId || prev.notionPageId,
        }));
        setFeedback({
          type: "success",
          message: `Skill "${editor.name}" saved to Notion (v${version}).`,
        });
        await fetchSkills();
      } else {
        setFeedback({ type: "error", message: "Failed to save skill to Notion." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    }
    setSaving(false);
  };

  const handleParsePaste = () => {
    if (!pasteContent.trim()) return;

    // Simple AI-style parsing: look for key patterns
    const lines = pasteContent.split("\n");
    let name = "";
    let prompt = "";
    let concepts = "";

    // Try to find a title line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        name = trimmed.replace(/^# /, "");
        break;
      }
      if (trimmed.startsWith("Name:") || trimmed.startsWith("Skill:")) {
        name = trimmed.split(":").slice(1).join(":").trim();
        break;
      }
    }

    // If no explicit name found, use first non-empty line
    if (!name) {
      name = lines.find((l) => l.trim().length > 0)?.trim().slice(0, 80) || "Unnamed Skill";
    }

    // Everything after the first line is the system prompt
    prompt = pasteContent;

    // Look for key concepts
    const conceptMatch = pasteContent.match(
      /(?:key concepts?|frameworks?|models?)[:\s]*([^\n]+)/i
    );
    if (conceptMatch) {
      concepts = conceptMatch[1].trim();
    }

    setEditor((prev) => ({
      ...prev,
      name: name || prev.name,
      slug: toSlug(name || prev.name),
      systemPrompt: prompt,
      keyConcepts: concepts || prev.keyConcepts,
    }));

    setShowPaste(false);
    setFeedback({
      type: "success",
      message: "Content parsed. Review the fields and adjust as needed.",
    });
  };

  // ── Auth Guard ──
  if (!isLoaded && !isGuestMode) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You don&apos;t have permission to access the Skills Registry.
            This area is restricted to admin users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Skills Registry"
        subtitle="Manage AI framework skills that power every tool and playbook"
      />

      {/* Feedback banner */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 mb-6 text-sm",
            feedback.type === "success"
              ? "border-green-500/30 bg-green-500/5 text-green-400"
              : "border-red-500/30 bg-red-500/5 text-red-400"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Panel: Skills List */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)]">
          <div className="flex items-center justify-between p-4 border-b border-[hsl(0_0%_100%/0.06)]">
            <h3 className="text-sm font-semibold">Skills ({skills.length})</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchSkills()}
                className="p-1.5 rounded-lg hover:bg-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh skills"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              </button>
              <button
                onClick={newSkill}
                className="p-1.5 rounded-lg hover:bg-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground transition-colors"
                title="New skill"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-xs text-muted-foreground">
                Loading skills...
              </div>
            ) : skills.length === 0 ? (
              <div className="p-4 text-xs text-muted-foreground">
                No active skills found. Create one or check your Notion connection.
              </div>
            ) : (
              skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => selectSkill(skill)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-[hsl(0_0%_100%/0.04)] hover:bg-[hsl(0_0%_100%/0.04)] transition-colors",
                    selectedId === skill.id && "bg-[hsl(0_0%_100%/0.06)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {skill.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          v{skill.version}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            skill.status === "active"
                              ? "bg-green-500/10 text-green-400"
                              : skill.status === "draft"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-red-500/10 text-red-400"
                          )}
                        >
                          {skill.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.02)] p-6">
          {/* Paste Import Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowPaste(!showPaste)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              <span>Paste Skill Export</span>
            </button>

            {showPaste && (
              <div className="mt-3 space-y-3">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste raw skill content from Claude here..."
                  className="w-full h-32 rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 resize-y font-mono"
                />
                <button
                  onClick={handleParsePaste}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0ea5e9] text-white text-xs font-medium hover:bg-[#0ea5e9]/90 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  Parse and Import
                </button>
              </div>
            )}
          </div>

          {/* Editor Fields */}
          <div className="space-y-5">
            {/* Row: Name + Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Skill Name
                </label>
                <input
                  value={editor.name}
                  onChange={(e) => {
                    setEditor((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug || toSlug(e.target.value),
                    }));
                  }}
                  placeholder="e.g. Paid Growth OS"
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Slug
                </label>
                <input
                  value={editor.slug}
                  onChange={(e) =>
                    setEditor((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="paid-growth-os"
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 font-mono"
                />
              </div>
            </div>

            {/* Row: Category + Version + Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={editor.category}
                  onChange={(e) =>
                    setEditor((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Version
                </label>
                <input
                  value={editor.version}
                  onChange={(e) =>
                    setEditor((prev) => ({ ...prev, version: e.target.value }))
                  }
                  placeholder="1.0"
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Status
                </label>
                <select
                  value={editor.status}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      status: e.target.value as EditorState["status"],
                    }))
                  }
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                System Prompt
              </label>
              <textarea
                value={editor.systemPrompt}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    systemPrompt: e.target.value,
                  }))
                }
                rows={10}
                placeholder="Full framework prompt content..."
                className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 resize-y font-mono"
              />
              <div className="text-[10px] text-muted-foreground mt-1">
                {editor.systemPrompt.length} characters
              </div>
            </div>

            {/* Context Rules */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Context Rules
              </label>
              <textarea
                value={editor.contextRules}
                onChange={(e) =>
                  setEditor((prev) => ({
                    ...prev,
                    contextRules: e.target.value,
                  }))
                }
                rows={2}
                placeholder="When to inject this skill..."
                className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 resize-y"
              />
            </div>

            {/* Key Concepts + Applies To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Key Concepts (comma-separated)
                </label>
                <input
                  value={editor.keyConcepts}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      keyConcepts: e.target.value,
                    }))
                  }
                  placeholder="HIRO, BEAR, Digital Air Cover"
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Applies To
                </label>
                <div className="flex flex-wrap gap-2">
                  {APPLIES_TO_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setEditor((prev) => ({
                          ...prev,
                          appliesTo: prev.appliesTo.includes(opt)
                            ? prev.appliesTo.filter((a) => a !== opt)
                            : [...prev.appliesTo, opt],
                        }));
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                        editor.appliesTo.includes(opt)
                          ? "border-[#0ea5e9]/50 bg-[#0ea5e9]/10 text-[#0ea5e9]"
                          : "border-[hsl(0_0%_100%/0.08)] text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Linked Playbooks + Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Linked Playbooks (slugs, comma-separated)
                </label>
                <input
                  value={editor.linkedPlaybooks}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      linkedPlaybooks: e.target.value,
                    }))
                  }
                  placeholder="hiro-campaign-launch, bear-testing-sprint"
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Linked Tools (slugs, comma-separated)
                </label>
                <input
                  value={editor.linkedTools}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      linkedTools: e.target.value,
                    }))
                  }
                  placeholder="ad-copy-generator, hook-writer"
                  className="w-full rounded-xl border border-[hsl(0_0%_100%/0.08)] bg-[hsl(0_0%_100%/0.04)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#0ea5e9]/50 font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-[hsl(0_0%_100%/0.06)]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0ea5e9] text-white text-sm font-medium hover:bg-[#0ea5e9]/90 disabled:opacity-50 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save to Notion"}
              </button>
              <button
                onClick={newSkill}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[hsl(0_0%_100%/0.08)] text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Skill
              </button>
              {editor.notionPageId && (
                <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/20 text-sm text-red-400 hover:bg-red-500/10 transition-colors ml-auto">
                  <Trash2 className="h-3.5 w-3.5" />
                  Deprecate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
