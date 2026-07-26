class SecurityGatekeeper {
    constructor() {
        // Automatically detects if running on GitHub Pages and sets the correct repository folder path
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages ? '/bsc-physics' : '';

        this.config = {
            bsc: {
                // Pre-computed SHA-256 hash for: "jugita baruah"
                hash: '1b141d8e12d09ec9560f64ee531584c3c3917409247d4834e0626b911762c953', 
                redirect: repoBase + '/portal-physics/index.html'
            },
            class9: {
                // Pre-computed SHA-256 hash for: "@class9science"
                hash: 'e6a8d8e573187c3b1713e5066914bc8a1ef982760fb2655eddf85523497d394b', 
                redirect: repoBase + '/portal-science/index.html'
            }
        };
    }

    async encodePassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async authenticate(portalId, password) {
        const target = this.config[portalId];
        if (!target) return false;

        // Clean input by removing accidental leading/trailing spaces
        const cleanPassword = password ? password.trim() : '';

        const inputHash = await this.encodePassword(cleanPassword);
        if (inputHash === target.hash) {
            sessionStorage.setItem(`access_granted_${portalId}`, 'true');
            sessionStorage.setItem('active_session_type', portalId);
            window.location.href = target.redirect;
            return true;
        }
        return false;
    }

    verifyAccess(portalId) {
        const hasAccess = sessionStorage.getItem(`access_granted_${portalId}`) === 'true';
        if (!hasAccess) {
            const isGitHubPages = window.location.hostname.includes('github.io');
            const repoBase = isGitHubPages ? '/bsc-physics' : '';
            window.location.href = repoBase + `/request-access.html?target=${portalId}&reason=unauthorized`;
        }
    }

    logout() {
        sessionStorage.clear();
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages ? '/bsc-physics' : '';
        window.location.href = repoBase + '/index.html';
    }
}

const AuthSystem = new SecurityGatekeeper();
