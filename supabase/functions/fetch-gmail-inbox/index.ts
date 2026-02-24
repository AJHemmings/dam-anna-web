import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch stored access token
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("access_token, expires_at")
    .eq("platform", "google")
    .single();

  console.log("Token query result:", JSON.stringify({ data: !!data, error }));

  if (error || !data) {
    return new Response("Google account not connected", {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Check if access token is expired
  if (new Date(data.expires_at) < new Date()) {
    return new Response("Access token expired. Please refresh.", {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Read pageToken from request body (sent as JSON by supabase.functions.invoke)
  const body = await req.json().catch(() => ({}));
  const pageToken = body.pageToken ?? "";

 // Fetch inbox thread list
  const gmailUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/threads");
  gmailUrl.searchParams.set("labelIds", "INBOX");
  gmailUrl.searchParams.set("maxResults", "20");
  if (pageToken) gmailUrl.searchParams.set("pageToken", pageToken);

  const listResponse = await fetch(gmailUrl.toString(), {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });

  const listData = await listResponse.json();

  if (!listResponse.ok) {
    return new Response(`Gmail API error: ${JSON.stringify(listData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Fetch minimal message data (from, subject, date) for each thread
  const threads = await Promise.all(
    (listData.threads ?? []).map(async (thread: { id: string }) => {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${thread.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${data.access_token}` } }
      );
      if (!msgResponse.ok) return thread;
      return await msgResponse.json();
    })
  );

  return new Response(JSON.stringify({ ...listData, threads }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});