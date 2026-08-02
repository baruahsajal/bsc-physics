/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - SECURITY & AUTH MODULE
 * File: assets/js/auth.js
 * Architecture: ES6 Module / Firebase Auth v10
 * ==========================================================================
 */

// Import Firebase directly from Google's web server (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// EXACT FIREBASE CONFIGURATION PROVIDED
const firebaseConfig = {
    apiKey: "AlzaSyCXXPGAVnV3xCHeynk-1uOj50BZZqyiuWg",
    authDomain: "bsc-physics-a7cfd.firebaseapp.com",
    projectId: "bsc-physics-a7cfd",
    storageBucket: "bsc-physics-a7cfd.firebasestorage.app",
    messagingSenderId: "639494268585",
    appId: "1:639494268585:web:abb551d7eadf1c6477abb8",
    measurementId: "G-JBF3T794JV"
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class AuthenticationSystem {
    constructor() {
        this.auth = auth;
        
        // Handle folder paths correctly for GitHub Pages deployment
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.repoBase = this.isGitHubPages ? '/bsc-physics' : '';

        this.init();
    }

    /**
     * Initializes the Authentication System
     */
    init() {
        // Expose globally so inline scripts or non-module scripts can access it
        window.AuthSystem = this;

        // Listen for global state changes to track user authentication status
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                console.log('[SECURITY] Valid session detected. Clearance granted.');
                if (window.AppCore) window.AppCore.setState('isAuthenticated', true);
            } else {
                console.log('[SECURITY] No active session. Clearance revoked.');
                if (window.AppCore) window.AppCore.setState('isAuthenticated', false);
            }
        });
    }

    /**
     * Authenticates a user using custom email and passcode inputs.
     * Supports accounts like harshborah600@gmail.com and sajalbaruah65@gmail.com.
     * 
     * @param {string} portal - 'bsc' or 'class9'
     * @param {string} email - The student's email address
     * @param {string} passcode - The student's assigned password
     * @returns {boolean} True if successful, false otherwise
     */
    async authenticate(portal, email, passcode) {
        try {
            if (window.AppCore) {
                window.AppCore.notify('Decrypting credentials... Standby.', 'info');
            }

            // Attempt Firebase login with the provided custom email and passcode
            await signInWithEmailAndPassword(this.auth, email, passcode);
            
            if (window.AppCore) {
                window.AppCore.notify('Access Granted. Rerouting to portal...', 'success');
            }

            // Redirect based on selected portal dropdown
            setTimeout(() => {
                window.location.href = portal === 'bsc' 
                    ? `${this.repoBase}/portal-physics/index.html` 
                    : `${this.repoBase}/index.html`; // Class 9 portal route
            }, 800);
            
            return true;

        } catch (error) {
            console.error('[SECURITY] Authentication Failed:', error.message);
            if (window.AppCore) {
                window.AppCore.notify('Access Denied: Invalid email, passcode or clearance level.', 'danger');
            }
            return false;
        }
    }

    /**
     * Security Check: Verifies the user is logged in before letting them see protected content.
     * Redirects to the request-access (login) page if unauthorized.
     * 
     * @param {string} target - The portal being accessed, used for redirect parameters
     */
    verifyAccess(target = 'bsc') {
        onAuthStateChanged(this.auth, (user) => {
            if (!user) {
                console.warn(`[SECURITY] Unauthorized access attempt to ${target}. Redirecting to login.`);
                window.location.href = `${this.repoBase}/request-access.html?target=${target}&reason=unauthorized`;
            }
        });
    }

    /**
     * Registers a new student account
     * 
     * @param {string} email - Student email
     * @param {string} password - Secure password
     */
    async registerStudent(email, password) {
        try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            console.log('[SECURITY] New student clearance established.');
            return { success: true };
        } catch (error) {
            console.error('[SECURITY] Registration Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logs the current user out and redirects to the main public interface
     */
    logout() {
        if (window.AppCore) {
            window.AppCore.notify('Initiating secure logout sequence...', 'warning');
        }

        signOut(this.auth).then(() => {
            setTimeout(() => {
                window.location.href = `${this.repoBase}/index.html`;
            }, 500);
        }).catch((error) => {
            console.error('[SECURITY] Logout Error:', error);
            if (window.AppCore) {
                window.AppCore.notify('Logout sequence failed.', 'danger');
            }
        });
    }
}

// Instantiate and expose to window for modules that cannot use import/export
const authSystemInstance = new AuthenticationSystem();
window.AuthSystem = authSystemInstance;

// Also export as a standard ES Module
export default authSystemInstance;
export { auth };
