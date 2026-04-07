-- ──────────────────────────────────────────────────────────────────────────────
-- Invitation tracking table
-- Purpose: enforce one-time-use, 24-hour expiry, and email uniqueness for
--          invitations independently of Supabase's built-in token mechanism.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invitations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  invited_by   TEXT        NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  used_at      TIMESTAMPTZ,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'used', 'expired'))
);

CREATE INDEX IF NOT EXISTS invitations_email_idx ON public.invitations (email);
CREATE INDEX IF NOT EXISTS invitations_status_idx ON public.invitations (status, expires_at);

-- RLS: table is only accessible via service-role (Edge Functions).
-- No public policies are granted.
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
