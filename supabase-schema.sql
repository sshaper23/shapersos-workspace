-- =============================================
-- TABLE 1: user_state (singleton per user)
-- =============================================
CREATE TABLE IF NOT EXISTS user_state (
  user_id TEXT PRIMARY KEY,
  active_north_star_id TEXT,
  active_brand_guidelines_id TEXT,
  active_mechanism_id TEXT,
  selected_model TEXT DEFAULT 'claude-sonnet-4-20250514',
  messaging_matrix_state JSONB,
  first_visit_at BIGINT,
  visit_count INTEGER DEFAULT 0,
  tools_used INTEGER DEFAULT 0,
  playbooks_completed INTEGER DEFAULT 0,
  last_active_date BIGINT,
  dismissed_progress_steps TEXT[] DEFAULT '{}',
  weekly_focus TEXT DEFAULT '',
  weekly_update JSONB DEFAULT '{"label":"","url":""}',
  cta_dismissed_at BIGINT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  ai_generations_used INTEGER DEFAULT 0,
  mechanic_messages_this_month INTEGER DEFAULT 0,
  mechanic_messages_reset_at BIGINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TABLE 2: north_star_profiles
-- =============================================
CREATE TABLE IF NOT EXISTS north_star_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  company TEXT DEFAULT '',
  website TEXT DEFAULT '',
  mission TEXT DEFAULT '',
  "values" TEXT DEFAULT '',
  uvp TEXT DEFAULT '',
  icp TEXT DEFAULT '',
  customer_values TEXT DEFAULT '',
  vocabulary TEXT DEFAULT '',
  problems TEXT DEFAULT '',
  dream_state TEXT DEFAULT '',
  offer TEXT DEFAULT '',
  buying_journey TEXT DEFAULT '',
  testimonials TEXT DEFAULT '',
  obstacles TEXT DEFAULT '',
  objections TEXT DEFAULT '',
  qualifies TEXT DEFAULT '',
  disqualifies TEXT DEFAULT '',
  buying_decision TEXT DEFAULT '',
  tried_before TEXT DEFAULT '',
  pre_sales_info TEXT DEFAULT '',
  additional TEXT DEFAULT '',
  business_model_type TEXT DEFAULT '',
  sales_model TEXT DEFAULT '',
  primary_channel TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  avg_deal_size TEXT DEFAULT '',
  sales_cycle_length TEXT DEFAULT '',
  notion_page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ns_profiles_user ON north_star_profiles(user_id);

-- =============================================
-- TABLE 3: brand_guidelines_profiles
-- =============================================
CREATE TABLE IF NOT EXISTS brand_guidelines_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Brand Guide',
  brand_purpose TEXT DEFAULT '',
  brand_transformation TEXT DEFAULT '',
  brand_mission TEXT DEFAULT '',
  competitors TEXT DEFAULT '',
  competitor_strengths TEXT DEFAULT '',
  differentiator TEXT DEFAULT '',
  personality_sliders TEXT DEFAULT '',
  personality_description TEXT DEFAULT '',
  natural_language TEXT DEFAULT '',
  avoid_words TEXT DEFAULT '',
  power_words TEXT DEFAULT '',
  first_encounter_feel TEXT DEFAULT '',
  six_month_feel TEXT DEFAULT '',
  three_year_fame TEXT DEFAULT '',
  brand_admire TEXT DEFAULT '',
  visual_aesthetic TEXT DEFAULT '',
  colour_direction TEXT DEFAULT '',
  visual_references TEXT DEFAULT '',
  best_testimonials TEXT DEFAULT '',
  proud_result TEXT DEFAULT '',
  founder_story TEXT DEFAULT '',
  never_do TEXT DEFAULT '',
  wrong_client TEXT DEFAULT '',
  distance_from TEXT DEFAULT '',
  synthesized_guidelines TEXT DEFAULT '',
  notion_page_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bg_profiles_user ON brand_guidelines_profiles(user_id);

-- =============================================
-- TABLE 4: sales_mechanisms
-- =============================================
CREATE TABLE IF NOT EXISTS sales_mechanisms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  business_name TEXT DEFAULT '',
  name TEXT DEFAULT '',
  linked_offer TEXT DEFAULT '',
  funnel_type TEXT DEFAULT '',
  stages JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  journey_notes TEXT DEFAULT '',
  mechanism_summary TEXT DEFAULT '',
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Partial', 'Complete')),
  notion_page_id TEXT,
  created_at BIGINT,
  updated_at BIGINT
);
CREATE INDEX IF NOT EXISTS idx_mechanisms_user ON sales_mechanisms(user_id);

-- =============================================
-- TABLE 5: alignment_analyses
-- =============================================
CREATE TABLE IF NOT EXISTS alignment_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  mechanism_id TEXT NOT NULL,
  overall_score INTEGER DEFAULT 0,
  revenue_leak TEXT DEFAULT '',
  raw_analysis TEXT DEFAULT '',
  chat_history JSONB DEFAULT '[]',
  created_at BIGINT,
  updated_at BIGINT,
  UNIQUE(user_id, mechanism_id)
);
CREATE INDEX IF NOT EXISTS idx_alignment_user ON alignment_analyses(user_id);

-- =============================================
-- TABLE 6: tool_chat_sessions
-- =============================================
CREATE TABLE IF NOT EXISTS tool_chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  tool_name TEXT DEFAULT '',
  title TEXT DEFAULT '',
  messages JSONB DEFAULT '[]',
  created_at BIGINT,
  updated_at BIGINT
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_tool ON tool_chat_sessions(user_id, tool_slug);

-- =============================================
-- TABLE 7: concept_library
-- =============================================
CREATE TABLE IF NOT EXISTS concept_library (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  business_id TEXT NOT NULL,
  name TEXT DEFAULT '',
  current_level INTEGER DEFAULT 1,
  levels JSONB DEFAULT '{}',
  concept_brief TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  created_at BIGINT,
  updated_at BIGINT
);
CREATE INDEX IF NOT EXISTS idx_concepts_user_biz ON concept_library(user_id, business_id);

-- =============================================
-- TABLE 8: favorites
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  tool_slug TEXT,
  playbook_slug TEXT,
  tool_name TEXT,
  playbook_name TEXT,
  "timestamp" BIGINT
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- =============================================
-- TABLE 9: recent_activity
-- =============================================
CREATE TABLE IF NOT EXISTS recent_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tool', 'playbook')),
  name TEXT DEFAULT '',
  slug TEXT DEFAULT '',
  action TEXT DEFAULT '',
  href TEXT,
  "timestamp" BIGINT
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON recent_activity(user_id);

-- =============================================
-- TABLE 10: token_usage_history
-- =============================================
CREATE TABLE IF NOT EXISTS token_usage_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_state(user_id) ON DELETE CASCADE,
  model TEXT DEFAULT '',
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  tool_slug TEXT,
  playbook_slug TEXT,
  "timestamp" BIGINT
);
CREATE INDEX IF NOT EXISTS idx_tokens_user ON token_usage_history(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE north_star_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_mechanisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE alignment_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: service role bypasses, anon blocked
CREATE POLICY "Service role full access" ON user_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON north_star_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON brand_guidelines_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON sales_mechanisms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON alignment_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON tool_chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON concept_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON recent_activity FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON token_usage_history FOR ALL USING (true) WITH CHECK (true);

-- Updated-at trigger for user_state
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON north_star_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON brand_guidelines_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
