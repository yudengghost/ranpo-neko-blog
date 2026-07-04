-- Run this in Supabase SQL Editor (https://app.supabase.com → your project → SQL Editor)
-- Creates tables and Row Level Security policies for blog stats and comments.

-- ===== article_stats =====
CREATE TABLE IF NOT EXISTS article_stats (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  dislikes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE article_stats ENABLE ROW LEVEL SECURITY;

-- Anyone can read stats
CREATE POLICY "stats_select" ON article_stats
  FOR SELECT USING (true);

-- Authenticated anon can upsert stats
CREATE POLICY "stats_upsert" ON article_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "stats_update" ON article_stats
  FOR UPDATE USING (true);

-- ===== comments =====
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (true);

-- ===== article_reactions =====
CREATE TABLE IF NOT EXISTS article_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (article_slug, user_id)
);

ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_select" ON article_reactions
  FOR SELECT USING (true);

CREATE POLICY "reactions_insert" ON article_reactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reactions_update" ON article_reactions
  FOR UPDATE USING (true);

CREATE POLICY "reactions_delete" ON article_reactions
  FOR DELETE USING (true);

-- ===== site_stats =====
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_visits INTEGER NOT NULL DEFAULT 0
);

-- Insert initial row if not exists
INSERT INTO site_stats (id, total_visits) VALUES (1, 0)
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_stats_select" ON site_stats
  FOR SELECT USING (true);

CREATE POLICY "site_stats_update" ON site_stats
  FOR UPDATE USING (true);

-- ===== RPC functions =====
-- Increment total visits
CREATE OR REPLACE FUNCTION increment_total_visits()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE site_stats SET total_visits = total_visits + 1 WHERE id = 1;
$$;

-- Increment article view (create row if not exists)
CREATE OR REPLACE FUNCTION increment_article_view(article_slug text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO article_stats (slug, views, likes, dislikes) VALUES (article_slug, 1, 0, 0)
  ON CONFLICT (slug) DO UPDATE SET views = article_stats.views + 1;
$$;

-- Recalculate like/dislike counts after reaction changes
CREATE OR REPLACE FUNCTION recalc_article_reactions(article_slug_param text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE article_stats SET
    likes = (SELECT COUNT(*) FROM article_reactions WHERE article_slug = article_slug_param AND reaction = 'like'),
    dislikes = (SELECT COUNT(*) FROM article_reactions WHERE article_slug = article_slug_param AND reaction = 'dislike'),
    updated_at = now()
  WHERE slug = article_slug_param;
$$;
