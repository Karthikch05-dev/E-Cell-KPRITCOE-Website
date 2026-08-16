import { serve } from "https://deno.land/std@0.195.0/http/server.ts";

interface RegistrationBody {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  department: string;
  event: string;
  teamSize: number;
  createdAt: string;
}

serve(async (req: Request) => {
  console.log("📨 Function called! Method:", req.method);
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json() as RegistrationBody;
    console.log("📨 Received registration data for:", body.email);
    
    const {
      registrationId,
      name,
      email,
      phone,
      college,
      year,
      department,
      event,
      teamSize,
      createdAt,
    } = body;

    // Validate required fields
    if (!registrationId || !name || !email || !event) {
      console.log("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get Google Apps Script configuration from Supabase secrets
    const appScriptUrl = Deno.env.get("APP_SCRIPT_WEB_APP_URL");
    const appScriptSecret = Deno.env.get("APP_SCRIPT_SHARED_SECRET");

    if (!appScriptUrl || !appScriptSecret) {
      console.error("❌ Google Apps Script configuration missing");
      return new Response(
        JSON.stringify({
          error: "Google Apps Script not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🔄 Forwarding registration to Google Apps Script...");

    // Forward registration data to Google Apps Script
    const appScriptResponse = await fetch(appScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: appScriptSecret,
        registrationId,
        name,
        email,
        phone,
        college,
        year,
        department,
        event,
        teamSize,
        createdAt,
      }),
    });

    const appScriptResult = await appScriptResponse.json();
    console.log("📊 Google Apps Script response:", appScriptResult);

    if (!appScriptResponse.ok) {
      console.error("❌ Google Apps Script error:", appScriptResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to process registration with Google Apps Script",
          details: appScriptResult,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Registration forwarded successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration stored and confirmation email sent",
        registrationId,
        appScriptData: appScriptResult,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
