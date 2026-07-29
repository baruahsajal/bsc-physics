/**
 * ==========================================================================
 * FUTURISTIC EDUCATIONAL OPERATING SYSTEM - DATABASE & CLOUD SYNC MODULE
 * File: assets/js/firebase.js
 * Architecture: ES6 Module / Firebase Firestore v10
 * ==========================================================================
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    arrayUnion,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Exact Firebase Configuration from the environment
const firebaseConfig = {
    apiKey: "AlzaSyCXXPGAVnV3xCHeynk-1uOj50BZZqyiuWg",
    authDomain: "bsc-physics-a7cfd.firebaseapp.com",
    projectId: "bsc-physics-a7cfd",
    storageBucket: "bsc-physics-a7cfd.firebasestorage.app",
    messagingSenderId: "639494268585",
    appId: "1:639494268585:web:abb551d7eadf1c6477abb8",
    measurementId: "G-JBF3T794JV"
};

// Ensure Firebase isn't initialized twice if auth.js already ran
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

class DatabaseSystem {
    constructor() {
        this.db = db;
        this.auth = auth;
        this.init();
    }

    /**
     * Initializes the Database System
     */
    init() {
        window.DatabaseModule = this;
        
        // Listen for authentication state to sync cloud data to local state upon login
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.syncCloudToLocal(user.uid);
            }
        });
    }

    /**
     * Synchronizes the user's cloud databank (Firestore) with their local AppCore state
     * @param {string} userId - The authenticated user's Firebase UID
     */
    async syncCloudToLocal(userId) {
        try {
            if (window.AppCore) window.AppCore.notify('Syncing local state with cloud databanks...', 'info');

            const userRef = doc(this.db, "students", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                
                // Update local core state with cloud data
                if (window.AppCore) {
                    if (data.xp) window.AppCore.setState('userXP', data.xp);
                    if (data.bookmarks) window.AppCore.setState('bookmarks', data.bookmarks);
                    if (data.theme) window.ThemeModule.applyTheme(data.theme, false);
                    
                    window.AppCore.notify('Cloud sync complete. All systems updated.', 'success');
                }
            } else {
                // Initialize new user profile in database
                await setDoc(userRef, {
                    xp: 0,
                    bookmarks: [],
                    recentActivity: [],
                    theme: 'cyberpunk',
                    createdAt: serverTimestamp()
                });
                console.log('[DATABASE] New user databank initialized.');
            }
        } catch (error) {
            console.error('[DATABASE] Sync Error:', error);
            if (window.AppCore) window.AppCore.notify('Cloud sync failed. Operating on local cache.', 'warning');
        }
    }

    /**
     * Saves the user's current XP progress to the cloud
     * @param {number} totalXP - The new total XP amount
     */
    async saveProgress(totalXP) {
        const user = this.auth.currentUser;
        if (!user) return; // Fail silently if not logged in

        try {
            const userRef = doc(this.db, "students", user.uid);
            await updateDoc(userRef, {
                xp: totalXP,
                lastUpdated: serverTimestamp()
            });
            console.log(`[DATABASE] Progress saved: ${totalXP} XP`);
        } catch (error) {
            console.error('[DATABASE] Failed to save progress:', error);
        }
    }

    /**
     * Adds a bookmark to the user's personal cloud databank
     * @param {string} title - Title of the module/page
     * @param {string} url - Path to the module
     */
    async addBookmark(title, url) {
        const user = this.auth.currentUser;
        if (!user) {
            if (window.AppCore) window.AppCore.notify('Authentication required to save bookmarks.', 'danger');
            return;
        }

        const newBookmark = { title, url, timestamp: Date.now() };

        try {
            const userRef = doc(this.db, "students", user.uid);
            await updateDoc(userRef, {
                bookmarks: arrayUnion(newBookmark)
            });

            // Update local state
            if (window.AppCore) {
                let currentBookmarks = window.AppCore.state.bookmarks || [];
                currentBookmarks.push(newBookmark);
                window.AppCore.setState('bookmarks', currentBookmarks);
                window.AppCore.notify(`Bookmark Saved: ${title}`, 'success');
            }
        } catch (error) {
            console.error('[DATABASE] Bookmark Error:', error);
            if (window.AppCore) window.AppCore.notify('Failed to secure bookmark to cloud.', 'danger');
        }
    }

    /**
     * Logs recent activity (e.g., viewing a lab or document)
     * @param {string} action - Description of the activity
     * @param {string} module - The subject or module interacted with
     */
    async logActivity(action, module) {
        const user = this.auth.currentUser;
        if (!user) return;

        const activityEntry = {
            action,
            module,
            timestamp: Date.now()
        };

        try {
            const userRef = doc(this.db, "students", user.uid);
            await updateDoc(userRef, {
                recentActivity: arrayUnion(activityEntry)
            });
        } catch (error) {
            console.error('[DATABASE] Activity Logging Error:', error);
        }
    }
}

// Instantiate and expose globally
const databaseSystemInstance = new DatabaseSystem();
export default databaseSystemInstance;
