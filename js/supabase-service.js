// js/supabase-service.js
class SupabaseAuthService {
    constructor() {
        //this.supabase = null;
        this.SUPABASE_URL = CONFIG.SUPABASE_URL;
        this.SUPABASE_KEY = CONFIG.SUPABASE_ANON_KEY;
    }

    initialize() {
        try {
            this.supabase = window.supabase.createClient(this.SUPABASE_URL, this.SUPABASE_KEY);
            console.log('✅ Supabase initialized');
            return true;
        } catch (error) {
            console.error('❌ Supabase initialization failed:', error);
            return false;
        }
    }

async userExists(email) {
    try {
        console.log('🔍 Checking user existence for:', email);
                
        // Try to get user by email (requires RLS to allow)
        const publicCheck = await this.checkUserViaPublicQuery(email);
        if (publicCheck !== null) {
            return publicCheck;
        }
                
    } catch (error) {
        console.error('User existence check failed:', error);
        // When in doubt, say user doesn't exist to prevent spam
        return { exists: false, method: 'error_fallback_false' };
    }
}

async checkUserViaPublicQuery(email) {
    try {        
        const { data, error } = await this.supabase
            .from('profiles')
            .select('id, email')
            .eq('email', email)
            .maybeSingle(); // Returns null if no row found
            
        if (error) {
            console.warn('Profiles query error:', error);
            return null;
        }
        
        return { 
            exists: data !== null, 
            method: 'profiles_table',
            userId: data?.id 
        };
        
    } catch (error) {
        console.error('Public query failed:', error);
        return null;
    }
}

    async generatePasswordResetToken(email) {
        try {
            // Generate a reset token using Supabase admin API
            // Note: This requires a service role key, not anon key
            // For production, you'd need a backend endpoint
            
            // For now, we'll use Supabase's built-in reset with a custom redirect
            const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password.html`,
            });

            if (error) throw error;
            
            // Return a placeholder - in production, you'd get the actual token
            return {
                success: true,
                message: 'Reset email sent via Supabase (fallback)'
            };
            
        } catch (error) {
            console.error('Token generation error:', error);
            throw error;
        }
    }

    async updatePassword(newPassword) {
        try {
            const { data, error } = await this.supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            
            return {
                success: true,
                user: data.user
            };
            
        } catch (error) {
            console.error('Password update error:', error);
            throw error;
        }
    }

    async getUserSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;
            return session;
            
        } catch (error) {
            console.error('Session error:', error);
            return null;
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }
}

// Create global instance
const supabaseAuth = new SupabaseAuthService();