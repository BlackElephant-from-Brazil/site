-- Migration: 021_blog_posts_create
-- Cria a tabela de posts do blog (módulo interno de conteúdo do site).

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT        NOT NULL UNIQUE,
  title           TEXT        NOT NULL,
  excerpt         TEXT        NOT NULL,
  keywords        TEXT[]      NOT NULL DEFAULT '{}',
  author_id       UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  content_html    TEXT        NOT NULL DEFAULT '',
  published_at    TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  created_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at      TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_admin" ON public.blog_posts
  FOR ALL TO authenticated
  USING  (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin'));

CREATE TRIGGER trg_blog_posts_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
