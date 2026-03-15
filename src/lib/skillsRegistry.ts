import type { Skill } from "@/types/skills";

interface CacheEntry {
  data: Skill[];
  timestamp: number;
}

class SkillsRegistry {
  private cache: CacheEntry | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  private isCacheValid(): boolean {
    return (
      this.cache !== null &&
      Date.now() - this.cache.timestamp < this.cacheExpiry
    );
  }

  /** Fetch all active skills from Notion via our API */
  async getAll(): Promise<Skill[]> {
    if (this.isCacheValid()) return this.cache!.data;

    try {
      const res = await fetch("/api/notion/skills-registry", {
        next: { revalidate: 300 },
      });
      if (!res.ok) return [];
      const json = await res.json();
      const skills = (json.skills || []) as Skill[];

      this.cache = { data: skills, timestamp: Date.now() };
      return skills;
    } catch {
      return this.cache?.data || [];
    }
  }

  /** Fetch a specific skill by slug */
  async getBySlug(slug: string): Promise<Skill | null> {
    const all = await this.getAll();
    return all.find((s) => s.slug === slug) || null;
  }

  /** Fetch all skills for a specific tool slug */
  async getForTool(toolSlug: string): Promise<Skill[]> {
    const all = await this.getAll();
    return all.filter(
      (s) =>
        s.status === "active" &&
        (s.appliesTo.includes("All Tools") ||
          s.linkedTools.includes(toolSlug))
    );
  }

  /** Fetch all skills for a specific playbook slug */
  async getForPlaybook(playbookSlug: string): Promise<Skill[]> {
    const all = await this.getAll();
    return all.filter(
      (s) =>
        s.status === "active" &&
        (s.appliesTo.includes("Specific Playbooks") ||
          s.linkedPlaybooks.includes(playbookSlug))
    );
  }

  /** Fetch mentor persona skill */
  async getMentorSkill(mentorSlug: string): Promise<Skill | null> {
    const all = await this.getAll();
    return (
      all.find(
        (s) =>
          s.status === "active" &&
          s.appliesTo.includes("Mentors") &&
          s.slug === mentorSlug
      ) || null
    );
  }

  /** Invalidate cache — called after admin updates */
  invalidateCache(): void {
    this.cache = null;
  }
}

export const skillsRegistry = new SkillsRegistry();
