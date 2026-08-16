import { serve } from "https://deno.land/std@0.195.0/http/server.ts";

interface RegistrationBody {
  name: string;
  email: string;
  event: string;
  teamSize: number;
  college: string;
}

serve(async (req: Request) => {
  console.log("📨 Function called! Method:", req.method);
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const body = await req.json();
    console.log("📨 Received data:", body);
    
    const { name, email, event, teamSize, college }: RegistrationBody = body;

    // Validate required fields
    if (!name || !email || !event) {
      console.log("❌ Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@ecell-kprit.dev";

    console.log("🔑 API Key configured:", !!apiKey);
    console.log("📧 From Email:", fromEmail);

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: linear-gradient(135deg, #172b57 0%, #f15a24 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: #f0f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .details p { margin: 8px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Confirmed! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering for our E-Cell KPRIT-COE event! We're excited to have you on board.</p>
              
              <div class="details">
                <p><strong>Registration Details:</strong></p>
                <p><strong>Event:</strong> ${event}</p>
                <p><strong>Team Size:</strong> ${teamSize}</p>
                <p><strong>College/Institution:</strong> ${college}</p>
                <p><strong>Email:</strong> ${email}</p>
              </div>

              <p>We'll send you further updates about the event schedule, venue details, and any other important information via this email.</p>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Check your email regularly for event updates</li>
                <li>Make sure to arrive on time on the event day</li>
                <li>Bring all required documents if applicable</li>
                <li>Feel free to reach out if you have any questions</li>
              </ul>

              <p>If you have any questions or need to make changes to your registration, please reply to this email.</p>
              
              <p>Best regards,<br><strong>E-Cell KPRIT-COE Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Entrepreneurship Cell - KPRIT College of Engineering. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // If Resend API key is configured, send via Resend
    if (apiKey) {
      try {
        console.log("📬 Sending email via Resend to:", email);
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: email,
            subject: `Welcome to E-Cell KPRIT-COE - Registration Confirmed for ${event}`,
            html: emailHtml,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("❌ Resend API error:", result);
        } else {
          console.log("✅ Email sent successfully:", result.id);
        }
      } catch (error) {
        console.error("❌ Email error:", error);
      }
    } else {
      console.warn("⚠️ RESEND_API_KEY not configured!");
    }

    console.log("✅ Returning success response");
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Registration successful"
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error) {
    console.error("❌ Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});
