class SecurityGatekeeper {
    constructor() {
        // Automatically detects if running on GitHub Pages and sets the correct repository folder path
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages ? '/bsc-physics' : '';

        this.config = {
            bsc: {
                hash: '4c9d26c38201522d5e01e71080ed04350168f9f333a79a46fbb35bef8e44dc42', // Passcode: Jugita
                redirect: repoBase + '/portal-physics/index.html'
            },
            class9: {
                hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // Passcode: 123456
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

        const inputHash = await this.encodePassword(password);
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
