// js/security-service.js
class SecurityService {
    constructor() {
        this.RESET_ATTEMPTS_KEY = 'cargolyze_reset_attempts';
        this.RESET_BLOCKED_KEY = 'cargolyze_reset_blocked';
        this.MAX_ATTEMPTS = 5;
        this.BLOCK_TIME = 15 * 60 * 1000; // 15 minutes
    }
    
    canAttemptReset(email) {
        const blockedUntil = localStorage.getItem(`${this.RESET_BLOCKED_KEY}_${email}`);
        
        if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
            const minutesLeft = Math.ceil((parseInt(blockedUntil) - Date.now()) / 60000);
            return {
                allowed: false,
                message: `Too many reset attempts. Please try again in ${minutesLeft} minute(s).`,
                retryAfter: parseInt(blockedUntil)
            };
        }
        
        return { allowed: true };
    }
    
    recordResetAttempt(email) {
        const attemptsKey = `${this.RESET_ATTEMPTS_KEY}_${email}`;
        let attempts = JSON.parse(localStorage.getItem(attemptsKey) || '[]');
        
        // Keep only attempts from last hour
        const oneHourAgo = Date.now() - 3600000;
        attempts = attempts.filter(time => time > oneHourAgo);
        
        // Add current attempt
        attempts.push(Date.now());
        localStorage.setItem(attemptsKey, JSON.stringify(attempts));
        
        // Check if exceeded max attempts
        if (attempts.length >= this.MAX_ATTEMPTS) {
            const blockUntil = Date.now() + this.BLOCK_TIME;
            localStorage.setItem(`${this.RESET_BLOCKED_KEY}_${email}`, blockUntil.toString());
            
            // Clear attempts after blocking
            localStorage.removeItem(attemptsKey);
            
            return {
                blocked: true,
                message: `Too many reset attempts. Account locked for 15 minutes.`,
                retryAfter: blockUntil
            };
        }
        
        return { blocked: false, attemptsLeft: this.MAX_ATTEMPTS - attempts.length };
    }
    
    clearAttempts(email) {
        localStorage.removeItem(`${this.RESET_ATTEMPTS_KEY}_${email}`);
        localStorage.removeItem(`${this.RESET_BLOCKED_KEY}_${email}`);
    }
    
    isEmailValid(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    isDisposableEmail(email) {
        const disposableDomains = [
            'tempmail.com', 'guerrillamail.com', 'mailinator.com',
            '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
        ];
        
        const domain = email.split('@')[1]?.toLowerCase();
        return disposableDomains.some(d => domain.includes(d));
    }
}

// Create global instance
const securityService = new SecurityService();