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

  const body = await req.json().catch(() => ({}));
  const { parentId, text } = body;

  if (!parentId || !text) {
    return new Response("Missing required fields: parentId, text", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const replyResponse = await fetch(
    "https://www.googleapis.com/youtube/v3/comments?part=snippet",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: {
          parentId,
          textOriginal: text,
        },
      }),
    }
  );

  const replyData = await replyResponse.json();

  if (!replyResponse.ok) {
    return new Response(`YouTube API error: ${JSON.stringify(replyData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true, comment: replyData }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});