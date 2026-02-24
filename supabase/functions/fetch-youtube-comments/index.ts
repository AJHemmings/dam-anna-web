import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY")!;

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

  let videoId: string | null = null;

  try {
    const text = await req.text();
    if (text) {
      const body = JSON.parse(text);
      videoId = body.videoId ?? null;
    }
  } catch {
    // ignore parse errors
  }

  // Also check query params as fallback
  if (!videoId) {
    const url = new URL(req.url);
    videoId = url.searchParams.get("videoId");
  }

  if (!videoId) {
    return new Response("Missing videoId parameter", { status: 400, headers: corsHeaders });
  }

  const commentsUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
  commentsUrl.searchParams.set("part", "snippet");
  commentsUrl.searchParams.set("videoId", videoId);
  commentsUrl.searchParams.set("order", "relevance");
  commentsUrl.searchParams.set("maxResults", "20");
  commentsUrl.searchParams.set("key", YOUTUBE_API_KEY);

  const commentsResponse = await fetch(commentsUrl.toString(), {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });

  const commentsData = await commentsResponse.json();

  if (!commentsResponse.ok) {
    return new Response(`YouTube API error: ${JSON.stringify(commentsData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ comments: commentsData.items ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});