// js/resend-service.js
class ResendService {
    constructor() {
        this.apiKey = CONFIG.RESEND_API_KEY; // Will be set via environment/config
        this.baseUrl = 'https://api.resend.com';
    }

    async initialize(apiKey) {
        if (apiKey) {
            this.apiKey = apiKey;
        }
        
        if (!this.apiKey || !this.apiKey.startsWith('re_')) {
            console.warn('Resend API key not properly configured');
            return false;
        }
        
        return true;
    }

    async sendPasswordResetEmail(email, resetLink) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Cargolyze <no-reply@cargolyze.app>',
                    to: [email],
                    subject: 'Reset Your Cargolyze Password',
                    html: this.generateResetEmailHTML(resetLink, email),
                    text: this.generateResetEmailText(resetLink),
                    tags: [
                        {
                            name: 'category',
                            value: 'password_reset'
                        }
                    ]
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send email');
            }

            console.log('✅ Reset email sent via Resend:', data.id);
            return {
                success: true,
                emailId: data.id,
                to: email
            };
            
        } catch (error) {
            console.error('❌ Resend API error:', error);
            throw error;
        }
    }

    generateResetEmailHTML(resetLink, email) {
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
            <style>
                body {
                    font-family: 'Montserrat', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                    line-height: 1.6;
                    color: #334155;
                    margin: 0;
                    padding: 0;
                    background-color: #f8fafc;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
                .email-header {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .logo-text {
                    font-size: 28px;
                    font-weight: 800;
                    background: linear-gradient(90deg, #ff5722, #f97316);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.5px;
                }
                .email-content {
                    padding: 40px 30px;
                }
                .reset-button {
                    display: inline-block;
                    background: linear-gradient(90deg, #1e3a8a, #3b82f6);
                    color: white;
                    text-decoration: none;
                    padding: 16px 40px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 16px;
                    margin: 30px 0;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .reset-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(30, 58, 138, 0.3);
                }
                .expiry-note {
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 25px 0;
                    color: #92400e;
                }
                .email-footer {
                    background: #f1f5f9;
                    padding: 25px 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #64748b;
                    border-top: 1px solid #e2e8f0;
                }
                .warning-box {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #991b1b;
                }
                .link-fallback {
                    word-break: break-all;
                    color: #3b82f6;
                    text-decoration: none;
                    font-size: 14px;
                }
                @media (max-width: 600px) {
                    .email-container {
                        border-radius: 0;
                    }
                    .email-content, .email-header {
                        padding: 30px 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <div class="logo">
                        <div class="logo-text">CARGOLYZE</div>
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px;">Shipment Tracking Automation</p>
                </div>
                
                <div class="email-content">
                    <h2 style="margin-top: 0; color: #0f172a;">Hello,</h2>
                    
                    <p>You recently requested to reset your password for your Cargolyze account. Click the button below to proceed:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetLink}" class="reset-button">Reset Password</a>
                    </div>
                    
                    <p style="text-align: center; margin-bottom: 25px;">
                        <a href="${resetLink}" class="link-fallback">${resetLink}</a>
                    </p>
                    
                    <div class="expiry-note">
                        <strong>⚠️ Important:</strong> This password reset link will expire at ${expirationTime} (1 hour from now) for security reasons.
                    </div>
                    
                    <div class="warning-box">
                        <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately.
                    </div>
                    
                    <p>For security reasons, this link can only be used once. After resetting your password, you'll be able to log in to your dashboard with your new credentials.</p>
                    
                    <p>Need help? <a href="mailto:support@cargolyze.app" style="color: #3b82f6; text-decoration: none;">Contact our support team</a> or visit our <a href="https://cargolyze.app/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>.</p>
                    
                    <p style="margin-top: 30px;">
                        Best regards,<br>
                        <strong>The Cargolyze Team</strong>
                    </p>
                </div>
                
                <div class="email-footer">
                    <p style="margin: 0 0 10px;">
                        <strong>🚢 Cargolyze Logistics Platform</strong><br>
                        Global Shipment Tracking & Automation
                    </p>
                    <p style="margin: 5px 0; font-size: 12px; opacity: 0.8;">
                        This email was sent to ${email}
                    </p>
                    <p style="margin: 10px 0 0; font-size: 12px;">
                        © ${currentYear} Cargolyze. All rights reserved.<br>
                        <a href="https://cargolyze.app/privacy" style="color: #64748b;">Privacy Policy</a> • 
                        <a href="https://cargolyze.app/terms" style="color: #64748b;">Terms of Service</a>
                    </p>
                </div>
            </div>
        </body>
        </html>`;
    }

    generateResetEmailText(resetLink) {
        return `
RESET YOUR CARGOLYZE PASSWORD

You requested to reset your password for Cargolyze.

Click the link below to reset your password:
${resetLink}

This link expires in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email or contact our support team immediately.

For security reasons, this link can only be used once.

Need help? Contact support: support@cargolyze.app

Best regards,
The Cargolyze Team

--
Cargolyze - Shipment Tracking Automation
© ${new Date().getFullYear()} Cargolyze. All rights reserved.
`;
    }

    async verifyApiKey() {
        try {
            const response = await fetch('https://api.resend.com/audiences', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                }
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Create global instance
const resendService = new ResendService();