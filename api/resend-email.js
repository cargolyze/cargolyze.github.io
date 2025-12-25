// api/resend-email.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email, resetLink } = req.body;
    
    if (!email || !resetLink) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and reset link are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }
    
    // Get Resend API key from environment
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured' 
      });
    }
    
    // Generate email content (copy your functions from resend-service.js)
    const htmlContent = generateResetEmailHTML(resetLink, email);
    const textContent = generateResetEmailText(resetLink);
    
    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Cargolyze <noreply@cargolyze.com>',
        to: [email],
        subject: 'Reset Your Cargolyze Password',
        html: htmlContent,
        text: textContent,
        tags: [
          {
            name: 'category',
            value: 'password_reset'
          },
          {
            name: 'project',
            value: 'cargolyze'
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(500).json({ 
        success: false, 
        error: data.message || 'Failed to send email' 
      });
    }
    
    console.log('✅ Email sent successfully:', data.id);
    
    return res.status(200).json({
      success: true,
      emailId: data.id,
      to: email,
      message: 'Password reset email sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
}

// ========== EMAIL TEMPLATE FUNCTIONS ==========
function generateResetEmailHTML(resetLink, email) {
  const currentYear = new Date().getFullYear();
  const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Cargolyze</title>
  </head>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 40px 30px; text-align: center;">
              <div style="font-size: 28px; font-weight: 800; background: linear-gradient(90deg, #ff5722, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px;">
                  CARGOLYZE
              </div>
              <h1 style="margin: 10px 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">Shipment Tracking Automation</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
              <h2 style="margin-top: 0; color: #0f172a;">Hello,</h2>
              <p>You recently requested to reset your password for your Cargolyze account. Click the button below to proceed:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetLink}" style="display: inline-block; background: linear-gradient(90deg, #1e3a8a, #3b82f6); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; transition: all 0.3s ease;">
                      Reset Password
                  </a>
              </div>
              
              <p style="text-align: center; color: #64748b; font-size: 14px; word-break: break-all;">
                  Or copy this link:<br>
                  <a href="${resetLink}" style="color: #3b82f6; text-decoration: none;">${resetLink}</a>
              </p>
              
              <!-- Expiry Notice -->
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 15px; margin: 25px 0; color: #92400e;">
                  <strong>⚠️ Important:</strong> This password reset link will expire at ${expirationTime} (1 hour from now) for security reasons.
              </div>
              
              <!-- Security Notice -->
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0; color: #991b1b;">
                  <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately.
              </div>
              
              <p>For security reasons, this link can only be used once. After resetting your password, you'll be able to log in to your dashboard with your new credentials.</p>
              
              <p>Need help? <a href="mailto:support@cargolyze.com" style="color: #3b82f6; text-decoration: none;">Contact our support team</a></p>
              
              <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The Cargolyze Team</strong>
              </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 25px 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px;">
                  <strong>🚢 Cargolyze Logistics Platform</strong><br>
                  Global Shipment Tracking & Automation
              </p>
              <p style="margin: 5px 0; font-size: 12px; opacity: 0.8;">
                  This email was sent to ${email}
              </p>
              <p style="margin: 10px 0 0; font-size: 12px;">
                  © ${currentYear} Cargolyze. All rights reserved.<br>
                  <a href="https://cargolyze.com/privacy" style="color: #64748b; text-decoration: none;">Privacy Policy</a> • 
                  <a href="https://cargolyze.com/terms" style="color: #64748b; text-decoration: none;">Terms of Service</a>
              </p>
          </div>
      </div>
  </body>
  </html>`;
}

function generateResetEmailText(resetLink) {
  return `RESET YOUR CARGOLYZE PASSWORD

You requested to reset your password for Cargolyze.

Click the link below to reset your password:
${resetLink}

This link expires in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email or contact our support team immediately.

For security reasons, this link can only be used once.

Need help? Contact support: support@cargolyze.com

Best regards,
The Cargolyze Team

--
Cargolyze - Shipment Tracking Automation`;
}
