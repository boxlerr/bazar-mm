CREATE TABLE IF NOT EXISTS public.password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON public.password_resets(token);

-- Index for cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON public.password_resets(expires_at);

-- RLS policies (optional, but good practice. Only admin should read/write ideally, or functions)
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Allow public access for now if needed by API without service role, likely we use Service Role in API.
-- Actually, better to keep it secure and only access via Service Role in API.
