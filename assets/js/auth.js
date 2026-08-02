/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - SECURITY & AUTH MODULE
 * File: assets/js/auth.js
 * Architecture: ES6 Module / Firebase Auth v10
 * ==========================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AlzaSyCXXPGAVnV3xCHeynk-1uOj50BZZqyiuWg",
    authDomain: "bsc-physics-a7cfd.firebaseapp.com",
    projectId: "bsc-physics-a7cfd",
    storageBucket: "bsc-physics-a7cfd.firebasestorage.app",
    messagingSenderId: "639494268585",
    appId: "1:639494268585:web:abb551d7eadf1c6477abb8",
    measurementId: "G-JBF3T794JV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class AuthenticationSystem {
    constructor() {
        this.auth = auth;
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.repoBase = this.isGitHubPages ? '/bsc-physics' : '';
        this.init();
    }

    init() {
        window.AuthSystem = this;

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
     * Authenticates a user using your specific email mapping configuration.
     * Portal 'class9' maps to sajalbaruah65@gmail.com
     * Portal 'bsc' maps to harshborah600@gmail.com
     */
    async authenticate(portal, passcode) {
        try {
            if (window.AppCore) {
                window.AppCore.notify('Decrypting credentials... Standby.', 'info');
            }

            // Explicit email mapping for your accounts
            const emailMap = {
                'class9': 'sajalbaruah65@gmail.com',
                'bsc': 'harshborah600@gmail.com'
            };
            
            const email = emailMap[portal] || 'sajalbaruah65@gmail.com';

            // Attempt Firebase login with the mapped email and given passcode
            await signInWithEmailAndPassword(this.auth, email, passcode);
            
            if (window.AppCore) {
                window.AppCore.notify('Access Granted. Rerouting to portal...', 'success');
            }

            setTimeout(() => {
                window.location.href = portal === 'bsc' 
                    ? `${this.repoBase}/portal-physics/index.html` 
                    : `${this.repoBase}/index.html`;
            }, 800);
            
            return true;

        } catch (error) {
            console.error('[SECURITY] Authentication Failed:', error.message);
            if (window.AppCore) {
                window.AppCore.notify('Access Denied: Invalid passcode or clearance level.', 'danger');
            }
            return false;
        }
    }

    verifyAccess(target = 'bsc') {
        onAuthStateChanged(this.auth, (user) => {
            if (!user) {
                console.warn(`[SECURITY] Unauthorized access attempt to ${target}. Redirecting to login.`);
                window.location.href = `${this.repoBase}/request-access.html?target=${target}&reason=unauthorized`;
            }
        });
    }

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

const authSystemInstance = new AuthenticationSystem();
window.AuthSystem = authSystemInstance;

export default authSystemInstance;
export { auth };
