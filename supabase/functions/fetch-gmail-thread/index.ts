import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("access_token, expires_at")
    .eq("platform", "google")
    .single();

  if (error || !data) {
    return new Response("Google account not connected", { status: 401, headers: corsHeaders });
  }

  if (new Date(data.expires_at) < new Date()) {
    return new Response("Access token expired. Please refresh.", { status: 401, headers: corsHeaders });
  }

  // Read threadId from request body
  const body = await req.json().catch(() => ({}));
  const threadId = body.threadId;

  if (!threadId) {
    return new Response("Missing threadId parameter", { status: 400, headers: corsHeaders });
  }

  const gmailResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    { headers: { Authorization: `Bearer ${data.access_token}` } }
  );

  const gmailData = await gmailResponse.json();

  if (!gmailResponse.ok) {
    return new Response(`Gmail API error: ${JSON.stringify(gmailData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(gmailData), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});