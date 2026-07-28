class SecurityGatekeeper {
    constructor() {
        const isGitHubPages = window.location.hostname.includes('github.io');
        this.repoBase = isGitHubPages ? '/bsc-physics' : '';

        // SECURITY UPGRADE: Passwords are now stored as SHA-256 hashes, not plain text.
        this.config = {
            bsc: {
                // Hash for: jugita baruah
                hash: '16104f21db7c822ff607d7211bf7386bf9a0980bd089069d3092289cb3ee6499', 
                redirect: this.repoBase + '/portal-physics/index.html'
            },
            class9: {
                // Hash for: @class9science
                hash: '6ed7819ceab97df05e26715bf8d022b7c7c34b172a6b22b64d1f56b3e390c58e',
                redirect: this.repoBase + '/portal-science/index.html'
            }
        };
    }

    // NEW: Helper function to securely scramble the password input
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async authenticate(portalId, password) {
        const cleanInput = password ? password.trim().toLowerCase() : '';
        if (!cleanInput) return false;

        // Scramble what the user typed to see if it matches our saved hashes
        const inputHash = await this.hashPassword(cleanInput);

        // Auto-detect portal based on the password hash
        let targetKey = portalId;
        if (inputHash === this.config.bsc.hash) targetKey = 'bsc';
        if (inputHash === this.config.class9.hash) targetKey = 'class9';

        const target = this.config[targetKey];
        if (!target) return false;

        // Compare the hashes instead of plain text
        if (inputHash === target.hash) {
            sessionStorage.setItem(`access_granted_${targetKey}`, 'true');
            sessionStorage.setItem('active_session_type', targetKey);
            window.location.href = target.redirect;
            return true;
        }
        return false;
    }

    verifyAccess(portalId) {
        const hasAccess = sessionStorage.getItem(`access_granted_${portalId}`) === 'true';
        if (!hasAccess) {
            window.location.href = this.repoBase + `/request-access.html?target=${portalId}&reason=unauthorized`;
        }
    }

    logout() {
        sessionStorage.clear();
        window.location.href = this.repoBase + '/index.html';
    }
}

const AuthSystem = new SecurityGatekeeper();
