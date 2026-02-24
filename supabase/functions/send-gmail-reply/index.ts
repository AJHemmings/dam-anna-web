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

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
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

  const { threadId, to, subject, message } = await req.json();

  if (!threadId || !to || !subject || !message) {
    return new Response("Missing required fields: threadId, to, subject, message", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (message.length > 10000) {
    return new Response("Message too long. Maximum 10000 characters.", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const mimeMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    message,
  ].join("\r\n");

  const encodedMessage = btoa(unescape(encodeURIComponent(mimeMessage)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const gmailResponse = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedMessage, threadId }),
    }
  );

  const gmailData = await gmailResponse.json();

  if (!gmailResponse.ok) {
    return new Response(`Gmail API error: ${JSON.stringify(gmailData)}`, {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true, messageId: gmailData.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});