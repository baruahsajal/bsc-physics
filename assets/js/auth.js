class SecurityGatekeeper {
    constructor() {
        this.config = {
            bsc: {
                hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // Passcode: 123456
                redirect: '/portal-physics/index.html'
            },
            class9: {
                hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // Passcode: 123456
                redirect: '/portal-science/index.html'
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
            window.location.href = `/request-access.html?target=${portalId}&reason=unauthorized`;
        }
    }

    logout() {
        sessionStorage.clear();
        window.location.href = '/index.html';
    }
}

const AuthSystem = new SecurityGatekeeper();
