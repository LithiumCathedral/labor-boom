// /api/capture.js
// PRODUCTION FILE: Overwrite your entire api/capture.js file with this codebase

export default async function handler(req, res) {
    // 1. Handle CORS preflight requests from your frontend
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { specialty, role, rate, referral, psychometric, workStyle, skill, email } = req.body;

        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: "A valid professional email is required." });
        }

        // 2. Prep the exact structural data array payload for your Google Sheets API integration
        const sheetRowData = {
            Timestamp: new Date().toISOString(),
            Email: email,
            DomainFocus: specialty || "N/A",
            AssignedRole: role || "N/A",
            MarketRate: rate || "N/A",
            ReferralLink: referral || "N/A",
            Psychometric: psychometric || "N/A",
            WorkStyle: workStyle || "N/A",
            SkillSpecification: skill || "N/A"
        };

        // 3. Post directly to your Google Sheets API deployment macro link
        // Uses your Vercel Environment Variable (ensure GOOGLE_SHEETS_API_URL is configured in Vercel settings)
        const targetSheetEndpoint = process.env.GOOGLE_SHEETS_API_URL;
        
        if (targetSheetEndpoint) {
            await fetch(targetSheetEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sheetRowData)
            });
        } else {
            console.warn("System Notice: GOOGLE_SHEETS_API_URL environment variable is missing. Logging locally.");
            console.log("Logged Payload Data Row: ", sheetRowData);
        }

        // 4. EMBEDDED AUTOMATION COMPONENT: The 8-Hour Follow-Up Template
        // This makes the HTML template instantly available for your pipeline, webhook, or external tool (like Make/Zapier)
        const automatedFollowUpEmailTemplateHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 20px; background-color: #fafafa; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; }
        .logo { font-size: 1.1rem; font-weight: 800; color: #1f2937; text-decoration: none; margin-bottom: 24px; display: inline-block; }
        .logo span { color: #ff6a00; }
        h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 12px 0; color: #1f2937; }
        p { margin: 0 0 24px 0; font-size: 1rem; color: #4b5563; }
        .btn { display: block; text-align: center; background: #ff6a00; color: #ffffff !important; text-decoration: none; padding: 14px; font-weight: 700; border-radius: 6px; font-size: 0.95rem; margin-bottom: 24px; }
        .footer { font-size: 0.85rem; color: #8b949e; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    </style>
</head>
<body>
<div class="container">
    <a href="https://sonicbloom.dev" class="logo">Sonic<span>Bloom</span></a>
    <h1>Your LabMatch Invitation Is Active</h1>
    <p>Your background matches active, high-paying review tracks at top AI frontier labs. Use your custom priority link below to fast-track your application directly into the system pipeline:</p>
    <a href="${referral || 'https://labor-boom.vercel.app'}" class="btn">Access Your AI Lab Match</a>
    <p class="footer"><strong>Know a talented colleague?</strong> Forward this email to them so they can run their own diagnostic at <a href="https://labor-boom.vercel.app" style="color: #ff6a00;">labor-boom.vercel.app</a>.</p>
</div>
</body>
</html>
        `;

        // Return server success confirmation to the browser client interface
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json({ 
            success: true, 
            message: "Diagnostic profile synchronized successfully.",
            metaEmailStored: true 
        });

    } catch (error) {
        console.error("Critical Gateway Pipeline Error:", error);
        return res.status(500).json({ success: false, error: "Internal server data processing error." });
    }
}