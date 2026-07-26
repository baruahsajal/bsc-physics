class SecurityGatekeeper {
    constructor() {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages ? '/bsc-physics' : '';

        this.config = {
            bsc: {
                passcode: 'jugita baruah',
                redirect: repoBase + '/portal-physics/index.html'
            },
            class9: {
                passcode: '@class9science',
                redirect: repoBase + '/portal-science/index.html'
            }
        };
    }

    async authenticate(portalId, password) {
        const cleanInput = password ? password.trim().toLowerCase() : '';

        // Determine target: If user typed the physics passcode, force BSC portal. 
        // If they typed the science passcode, force Class 9 portal.
        let targetKey = portalId;
        if (cleanInput === 'jugita baruah') {
            targetKey = 'bsc';
        } else if (cleanInput === '@class9science') {
            targetKey = 'class9';
        }

        const target = this.config[targetKey];
        if (!target) return false;

        if (cleanInput === target.passcode.toLowerCase()) {
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
