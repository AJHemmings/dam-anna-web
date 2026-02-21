import { createClient } from "jsr:@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch the stored Google tokens
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("refresh_token")
    .eq("platform", "google")
    .single();

  if (error || !data) {
    return new Response("No Google tokens found", { status: 404 });
  }

  // Exchange refresh token for a new access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return new Response(`Token refresh failed: ${JSON.stringify(tokens)}`, {
      status: 500,
    });
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Update the stored access token
  const { error: dbError } = await supabase
    .from("oauth_tokens")
    .update({
      access_token: tokens.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("platform", "google");

  if (dbError) {
    return new Response(`Database error: ${dbError.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});