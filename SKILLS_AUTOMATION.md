# Skills Registry Automation Setup

## Overview

The ShapersOS Skills Registry is a live Notion database that stores all AI prompt infrastructure for the platform. When a skill is created or updated in Claude Code, it flows into Notion and propagates to the platform automatically — no code deployment required.

## Architecture

```
Claude Code (skill files) → Zapier Webhook → Notion Skills Registry → ShapersOS Runtime
```

## How It Works

When Sam creates or updates a skill in Claude, he has two options:

### Option A: Admin Panel (Recommended)
1. Navigate to `/admin/skills` in ShapersOS
2. Click "New Skill" or select an existing skill to edit
3. Use the "Paste Skill Export" section to paste raw skill content from Claude
4. Click "Parse and Import" — AI parses the content into structured fields
5. Review the parsed fields, then click "Save to Notion"
6. The skill is live across the platform immediately

### Option B: Zapier Webhook
1. Sam pastes skill content into a structured JSON payload
2. Sends it to a Zapier webhook URL
3. Zapier writes/updates the page in the Notion Skills Registry

## Zapier Flow

### Trigger: Webhooks by Zapier (Catch Hook)
- Sam sends skill content to this webhook URL
- Payload format: JSON with fields matching Notion schema

### Action: Notion — Create or Update Page
- Database: ShapersOS Skills Registry
- Match on: `Skill Slug` (update if exists, create if new)
- Map all payload fields to Notion properties

## Payload Format

```json
{
  "skill_name": "Paid Growth OS",
  "skill_slug": "paid-growth-os",
  "category": "Paid Growth",
  "version": "1.2",
  "status": "Active",
  "system_prompt": "[full prompt content]",
  "context_rules": "[when to inject this skill — e.g. 'Inject into all tools tagged with demand-creation category']",
  "key_concepts": "HIRO, BEAR, Digital Air Cover, 4PI",
  "applies_to": ["All Tools"],
  "linked_playbooks": "hiro-campaign-launch, bear-testing-sprint",
  "linked_tools": "ad-copy-generator, hook-writer"
}
```

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `skill_name` | string | Display name (e.g. "Paid Growth OS") |
| `skill_slug` | string | URL-safe identifier (e.g. "paid-growth-os") |
| `category` | string | One of: Paid Growth, Copywriting, Sales, Strategy, Messaging, Playbook, Mentor |
| `version` | string | Semver string (e.g. "1.0", "1.2") |
| `status` | string | One of: Active, Draft, Deprecated |
| `system_prompt` | string | The full framework prompt content |
| `context_rules` | string | When and how to inject this skill |
| `key_concepts` | string | Comma-separated list of core framework terms |
| `applies_to` | array | One or more of: All Tools, Specific Playbooks, Mentors, Messaging Matrix |
| `linked_playbooks` | string | Comma-separated slugs of playbooks this skill powers |
| `linked_tools` | string | Comma-separated slugs of tools this skill enhances |

## Notion Database

- **Name:** ShapersOS Skills Registry
- **Data Source ID:** `cf88071e-bcff-42e2-ac2f-fd24acbd35e7`
- **Env Variable:** `NOTION_SKILLS_REGISTRY_DB`

## Environment Setup

Add to `.env.local`:
```
NOTION_SKILLS_REGISTRY_DB=cf88071e-bcff-42e2-ac2f-fd24acbd35e7
```

## How Skills Are Used at Runtime

1. When a user generates AI content in any tool or playbook, the platform fetches relevant skills from the registry
2. Skills are matched by:
   - `applies_to` containing "All Tools" (global skills)
   - `linked_tools` containing the current tool's slug
   - `linked_playbooks` containing the current playbook's slug
3. Active skills' system prompts are prepended to the tool's base prompt
4. Skills are cached for 5 minutes to avoid excessive Notion API calls
5. The admin panel has a "Refresh Skills" button for immediate cache invalidation

## Zapier Setup Steps

1. Create a new Zap in Zapier
2. **Trigger:** Webhooks by Zapier → Catch Hook
3. Copy the webhook URL
4. **Action:** Notion → Create Database Item
   - Connect your Notion account
   - Select "ShapersOS Skills Registry" database
   - Map fields from the webhook payload to Notion properties
5. Add a second action: Notion → Update Database Item
   - Set filter: if `skill_slug` matches an existing entry, update instead of create
6. Test the Zap with a sample payload
7. Turn it on
