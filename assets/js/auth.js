// Import Firebase directly from Google's web server (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// YOUR EXACT FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyCXXPGAVnV3xCHeynk-1uOj50BZZqyiuWg",
  authDomain: "bsc-physics-a7cfd.firebaseapp.com",
  projectId: "bsc-physics-a7cfd",
  storageBucket: "bsc-physics-a7cfd.firebasestorage.app",
  messagingSenderId: "639494268585",
  appId: "1:639494268585:web:abb551d7eadf1c6477abb8",
  measurementId: "G-JBF3T794JV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if running on GitHub Pages to handle folder paths correctly
const isGitHubPages = window.location.hostname.includes('github.io');
const repoBase = isGitHubPages ? '/bsc-physics' : '';

// 1. Switch between Login and Sign Up tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.getAttribute('data-target')).classList.add('active');
    });
});

// 2. Sign Up Button Logic (Registers student in Firebase)
const btnSignup = document.getElementById('btn-signup');
if (btnSignup) {
    btnSignup.addEventListener('click', async () => {
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        if (!email || !password) {
            alert("Please enter both an email and a password.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Success! Your account has been registered. You can now log in.");
            document.querySelector('[data-target="login"]').click(); // Switch to login tab automatically
        } catch (error) {
            alert("Registration Error: " + error.message);
        }
    });
}

// 3. Log In Button Logic
const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const portal = document.getElementById('login-portal').value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect based on selected portal dropdown
            window.location.href = portal === 'bsc' 
                ? `${repoBase}/portal-physics/index.html` 
                : `${repoBase}/portal-science/index.html`;
        } catch (error) {
            alert("Invalid email or password.");
        }
    });
}

// 4. Security Check (verifies user is logged in before letting them see content)
export function verifyAccess() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = repoBase + '/index.html'; // Redirect to home page if not logged in
        }
    });
}

// 5. Logout Function
export function logoutUser() {
    signOut(auth).then(() => {
        window.location.href = repoBase + '/index.html';
    });
}
