import { createClient } from "jsr:@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`OAuth error: ${error}`, { status: 400, headers: corsHeaders });
  }

  if (!code) {
    return new Response("Missing authorization code", { status: 400, headers: corsHeaders });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return new Response(`Token exchange failed: ${JSON.stringify(tokens)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const upsertData: Record<string, string> = {
    platform: "google",
    access_token: tokens.access_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };
  // Google only returns a refresh_token on first auth or when prompt=consent forces a new one.
  // Only overwrite the stored refresh_token if we actually received a new one.
  if (tokens.refresh_token) {
    upsertData.refresh_token = tokens.refresh_token;
  }

  const { error: dbError } = await supabase
    .from("oauth_tokens")
    .upsert(upsertData, { onConflict: "platform" });

  if (dbError) {
    return new Response(`Database error: ${dbError.message}`, { status: 500, headers: corsHeaders });
  }

  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: "https://www.damannaband.com/admin" },
  });
});