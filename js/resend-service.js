// js/resend-service.js (Updated for Vercel)
class ResendService {
    constructor() {
        // Your Vercel deployment URL (will be set after deployment)
        this.endpoint = 'https://cargolyze.vercel.app/api/resend-email';
        // For local development:
        // this.endpoint = 'http://localhost:3000/api/resend-email';
    }

    async initialize() {
        // Test connection
        try {
            const response = await fetch(this.endpoint, {
                method: 'OPTIONS'
            });
            return response.ok;
        } catch (error) {
            console.warn('Vercel endpoint not reachable:', error.message);
            return false;
        }
    }

    async sendPasswordResetEmail(email, resetLink) {
        try {
            console.log('📧 Sending reset email via Vercel to:', email);
            
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    resetLink: resetLink
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('Vercel API error:', data);
                throw new Error(data.error || 'Failed to send email');
            }
            
            console.log('✅ Email sent successfully via Vercel:', data.emailId);
            return {
                success: true,
                emailId: data.emailId,
                to: email,
                message: data.message
            };
            
        } catch (error) {
            console.error('❌ Email sending error:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('Failed to send email')) {
                throw new Error('Unable to send reset email. Please try again in a few minutes.');
            } else if (error.message.includes('Invalid email')) {
                throw new Error('Please enter a valid email address.');
            } else {
                throw new Error('Email service is temporarily unavailable. Please try again later.');
            }
        }
    }
}

const resendService = new ResendService();
