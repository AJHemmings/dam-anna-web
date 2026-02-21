import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch stored access token
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("access_token, expires_at")
    .eq("platform", "google")
    .single();

  if (error || !data) {
    return new Response("Google account not connected", { status: 401 });
  }

  // Check if access token is expired
  if (new Date(data.expires_at) < new Date()) {
    return new Response("Access token expired. Please refresh.", { status: 401 });
  }

  // Get page token from request for pagination
  const url = new URL(req.url);
  const pageToken = url.searchParams.get("pageToken") || "";

  // Fetch inbox threads from Gmail
  const gmailUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/threads");
  gmailUrl.searchParams.set("labelIds", "INBOX");
  gmailUrl.searchParams.set("maxResults", "20");
  if (pageToken) gmailUrl.searchParams.set("pageToken", pageToken);

  const gmailResponse = await fetch(gmailUrl.toString(), {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });

  const gmailData = await gmailResponse.json();

  if (!gmailResponse.ok) {
    return new Response(`Gmail API error: ${JSON.stringify(gmailData)}`, {
      status: 500,
    });
  }

  return new Response(JSON.stringify(gmailData), {
    headers: { "Content-Type": "application/json" },
  });
});