import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const YOUTUBE_CHANNEL_ID = Deno.env.get("YOUTUBE_CHANNEL_ID")!;
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

  // Step 1: fetch the channel to get the real uploads playlist ID
  const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
  channelUrl.searchParams.set("part", "contentDetails");
  channelUrl.searchParams.set("id", YOUTUBE_CHANNEL_ID);
  channelUrl.searchParams.set("key", YOUTUBE_API_KEY);

  const channelResponse = await fetch(channelUrl.toString(), {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });

  const channelData = await channelResponse.json();

  if (!channelResponse.ok || !channelData.items?.length) {
    return new Response(`YouTube channel error: ${JSON.stringify(channelData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Step 2: fetch videos from the uploads playlist
  const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistUrl.searchParams.set("part", "snippet,contentDetails");
  playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
  playlistUrl.searchParams.set("maxResults", "20");
  playlistUrl.searchParams.set("key", YOUTUBE_API_KEY);

  const playlistResponse = await fetch(playlistUrl.toString(), {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });

  const playlistData = await playlistResponse.json();

  if (!playlistResponse.ok) {
    return new Response(`YouTube API error: ${JSON.stringify(playlistData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  const videoIds = playlistData.items
    ?.map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId)
    .filter(Boolean)
    .join(",");

  if (!videoIds) {
    return new Response(JSON.stringify({ videos: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Step 3: fetch statistics for each video
  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.searchParams.set("part", "snippet,statistics");
  statsUrl.searchParams.set("id", videoIds);
  statsUrl.searchParams.set("key", YOUTUBE_API_KEY);

  const statsResponse = await fetch(statsUrl.toString(), {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });

  const statsData = await statsResponse.json();

  if (!statsResponse.ok) {
    return new Response(`YouTube API error: ${JSON.stringify(statsData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ videos: statsData.items ?? [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});