#!/usr/bin/env npx tsx
/**
 * Skill Quality Test Harness
 *
 * Sends test prompts to the live platform API and checks whether
 * the AI responses contain the right thinking (green flags) and
 * avoid wrong defaults (red flags).
 *
 * Usage:
 *   npx tsx scripts/test-skills.ts                    # test against production
 *   npx tsx scripts/test-skills.ts http://localhost:3000  # test against local dev
 *   npx tsx scripts/test-skills.ts --verbose           # show full AI responses
 */

// ─── Configuration ───────────────────────────────────────────────

const DEFAULT_BASE_URL = "https://workspace.shapersos.com";
const API_PATH = "/api/chat";
const TIMEOUT_MS = 60_000;

// ─── Test Definitions ────────────────────────────────────────────

interface SkillTest {
  name: string;
  category: string;
  prompt: string;
  /** At least ONE of these patterns must appear (case-insensitive) */
  greenFlags: string[];
  /** NONE of these should appear as the PRIMARY/FIRST recommendation (case-insensitive).
   *  Patterns prefixed with "!" are negation-aware: they only trigger if the phrase
   *  appears WITHOUT a negation word (not, don't, isn't, never, stop, before) within
   *  30 chars before it. */
  redFlags: string[];
  /** Minimum green flags that must match to pass (default: 1) */
  minGreenMatches?: number;
}

const tests: SkillTest[] = [
  // ─── Paid Growth OS: Rising CPL ───
  {
    name: "Rising CPL — should diagnose, not prescribe",
    category: "Paid Growth OS",
    prompt: "My cost per lead keeps rising — what should I look at first?",
    greenFlags: [
      "diagnos",          // diagnose/diagnostic
      "4PI",
      "portfolio",
      "what changed",
      "when did",         // asking timeline questions
      "ecosystem",
      "tell me",          // asking diagnostic questions
      "questions",
    ],
    redFlags: [
      "refresh your creative",
      "creative is burned",
      "pause high-frequency",
      "your creative is fatigued",
    ],
    minGreenMatches: 2,
  },
  {
    name: "Scaling budget + rising CPL — should identify portfolio imbalance",
    category: "Paid Growth OS",
    prompt: "We increased our Meta ad budget from $5k to $15k/month and now our CPL is up 40%. What's going wrong?",
    greenFlags: [
      "portfolio",
      "imbalance",
      "demand creation",
      "awareness",
      "upstream",
      "harvest",
      "scaling",
      "4PI",
    ],
    redFlags: [
      "creative fatigue",
      "refresh your ads",
      "your frequency is too high",
    ],
    minGreenMatches: 2,
  },
  {
    name: "Sudden CPL spike — should ask what changed",
    category: "Paid Growth OS",
    prompt: "Our ads were working great, then 3 weeks ago CPL doubled. Nothing changed in our ad account.",
    greenFlags: [
      "outside",
      "ecosystem",
      "organic",
      "what changed",
      "organic content",
      "email",
      "website",
      "buying journey",
    ],
    redFlags: [
      "test new hooks",
      "your creative is burned",
    ],
    minGreenMatches: 2,
  },
  {
    name: "High frequency — should still run full diagnosis",
    category: "Paid Growth OS",
    prompt: "My frequency is at 4.5 and CPL is rising. Should I just kill all my ads and start fresh?",
    greenFlags: [
      "diagnos",
      "portfolio",
      "before",
      "symptom",
      "root cause",
      "4PI",
      "what changed",
    ],
    redFlags: [
      "yes, pause everything",
      "kill all your ads",
    ],
    minGreenMatches: 1,
  },
  {
    name: "Organic content stopped — should connect ecosystem dots",
    category: "Paid Growth OS",
    prompt: "I stopped posting organic content a month ago and now my ad costs are up 35%. Is this related?",
    greenFlags: [
      "awareness",
      "buying journey",
      "ecosystem",
      "top of funnel",
      "organic",
      "connected",
      "related",
      "upstream",
    ],
    redFlags: [
      "unrelated",
      "organic doesn't affect",
      "coincidence",
    ],
    minGreenMatches: 2,
  },

  // ─── Marketing Strategy OS ───
  {
    name: "Strategy question — should use 3-pillar framework",
    category: "Marketing Strategy OS",
    prompt: "My marketing isn't working. Where do I start?",
    greenFlags: [
      "offer",
      "message",
      "mechanism",
      "pillar",
      "diagnos",
      "bottleneck",
    ],
    redFlags: [
      "run more ads",
      "increase your budget",
    ],
    minGreenMatches: 2,
  },

  // ─── Sales Frameworks OS ───
  {
    name: "Objection handling — should use C.A.L.M. method",
    category: "Sales Frameworks OS",
    prompt: "A prospect said 'I need to think about it' on our sales call. How should I handle this?",
    greenFlags: [
      "C.A.L.M",
      "confirm",
      "acknowledge",
      "leverage",
      "objection",
    ],
    redFlags: [
      "give them time",
      "follow up next week",
    ],
    minGreenMatches: 2,
  },

  // ─── Copywriting OS ───
  {
    name: "Hook writing — should reference hook types or awareness stages",
    category: "Copywriting OS",
    prompt: "I need to write a hook for a Facebook ad targeting gym owners. Give me options.",
    greenFlags: [
      "curiosity",
      "contrarian",
      "story",
      "stat",
      "bold claim",
      "hook",
      "unaware",
      "problem aware",
      "solution aware",
      "awareness",
      "open a loop",
      "challenge",
    ],
    redFlags: [],
    minGreenMatches: 3,
  },
];

// ─── Runner ──────────────────────────────────────────────────────

async function callChatAPI(baseUrl: string, prompt: string): Promise<string> {
  const url = `${baseUrl}${API_PATH}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";

    // Handle SSE streaming response
    if (contentType.includes("text/event-stream")) {
      const text = await res.text();
      const chunks: string[] = [];
      for (const line of text.split("\n")) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) chunks.push(data.text);
            if (data.error) throw new Error(`API error: ${data.error}`);
          } catch (e) {
            if (e instanceof Error && e.message.startsWith("API error:")) throw e;
          }
        }
      }
      return chunks.join("");
    }

    // Handle JSON response (mock mode)
    const json = await res.json();
    return json.content || json.message || JSON.stringify(json);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check if a phrase appears in an "affirming" context (not negated).
 * Returns true if the phrase is found AND is being recommended/stated positively
 * (i.e., NOT preceded by negation words like "not", "don't", "isn't", "never").
 */
function isAffirmed(text: string, phrase: string): boolean {
  const lower = text.toLowerCase();
  const phraseLower = phrase.toLowerCase();
  let pos = 0;

  while ((pos = lower.indexOf(phraseLower, pos)) !== -1) {
    // Check 50 chars before this occurrence for negation
    const prefix = lower.slice(Math.max(0, pos - 50), pos);
    const negations = ["not ", "n't ", "never ", "isn't ", "don't ", "doesn't ", "stop ", "before ", "beyond ", "rather than "];
    const isNegated = negations.some((neg) => prefix.includes(neg));

    if (!isNegated) return true; // Found an affirming usage
    pos += phraseLower.length;
  }

  return false; // Only negated usages found (or not present at all)
}

function checkFlags(
  response: string,
  flags: string[],
  mode: "green" | "red"
): { matched: string[]; unmatched: string[] } {
  const lower = response.toLowerCase();
  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const flag of flags) {
    if (mode === "red") {
      // For red flags, check if the phrase is used affirmatively (not negated)
      if (isAffirmed(lower, flag)) {
        matched.push(flag);
      } else {
        unmatched.push(flag);
      }
    } else {
      // For green flags, simple inclusion check
      if (lower.includes(flag.toLowerCase())) {
        matched.push(flag);
      } else {
        unmatched.push(flag);
      }
    }
  }

  return { matched, unmatched };
}

async function runTests(baseUrl: string, verbose: boolean) {
  console.log(`\n🧪 Skill Quality Test Harness`);
  console.log(`   Target: ${baseUrl}`);
  console.log(`   Tests:  ${tests.length}`);
  console.log(`${"─".repeat(60)}\n`);

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const test of tests) {
    process.stdout.write(`⏳ [${test.category}] ${test.name}...`);

    try {
      const response = await callChatAPI(baseUrl, test.prompt);
      const minGreen = test.minGreenMatches ?? 1;

      const green = checkFlags(response, test.greenFlags, "green");
      const red = checkFlags(response, test.redFlags, "red");

      const greenPass = green.matched.length >= minGreen;
      const redPass = red.matched.length === 0;
      const testPass = greenPass && redPass;

      // Clear the "running" line and print result
      process.stdout.write("\r");

      if (testPass) {
        console.log(`✅ PASS: [${test.category}] ${test.name}`);
        console.log(`   Green flags hit: ${green.matched.join(", ")}`);
        passed++;
      } else {
        console.log(`❌ FAIL: [${test.category}] ${test.name}`);
        if (!greenPass) {
          console.log(`   ⚠️  Only ${green.matched.length}/${minGreen} required green flags found`);
          console.log(`   Green matched: ${green.matched.join(", ") || "(none)"}`);
          console.log(`   Green missed:  ${green.unmatched.join(", ")}`);
        }
        if (!redPass) {
          console.log(`   🚩 Red flags triggered: ${red.matched.join(", ")}`);
        }
        failures.push(`[${test.category}] ${test.name}`);
        failed++;
      }

      if (verbose) {
        console.log(`\n   ── Response ──`);
        console.log(`   ${response.slice(0, 500).replace(/\n/g, "\n   ")}...`);
      }

      console.log();
    } catch (err) {
      process.stdout.write("\r");
      console.log(`💥 ERROR: [${test.category}] ${test.name}`);
      console.log(`   ${err instanceof Error ? err.message : err}\n`);
      failures.push(`[${test.category}] ${test.name} (ERROR)`);
      failed++;
    }
  }

  // ─── Summary ───
  console.log(`${"─".repeat(60)}`);
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);

  if (failures.length > 0) {
    console.log(`❌ Failures:`);
    failures.forEach((f) => console.log(`   • ${f}`));
    console.log();
  }

  if (failed === 0) {
    console.log(`🎉 All tests passed! Skills are responding correctly.\n`);
  } else {
    console.log(`⚠️  ${failed} test(s) need attention. Review the skill definitions in:`);
    console.log(`   src/data/platform-skills.ts\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// ─── Entry Point ─────────────────────────────────────────────────

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const baseUrl = args.find((a) => a.startsWith("http")) || DEFAULT_BASE_URL;

runTests(baseUrl, verbose);
