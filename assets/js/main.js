document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAccordions();
    initAnswerReveals();
    initMobileMenu();
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-tab');
            if (!targetId) return;

            // Deactivate all
            const container = e.currentTarget.closest('.container') || document;
            container.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            container.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));

            // Activate target
            e.currentTarget.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if(targetContent) targetContent.classList.add('active');
        });
    });
}

function initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active-acc');
            const panel = this.nextElementSibling;
            
            // Toggle icon if exists
            const icon = this.querySelector('.fa-chevron-down');
            if(icon) {
                icon.style.transform = this.classList.contains('active-acc') ? 'rotate(180deg)' : 'rotate(0)';
                icon.style.transition = 'transform 0.3s ease';
            }

            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
}

function initAnswerReveals() {
    const revealBtns = document.querySelectorAll('.show-ans-btn');
    revealBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const answerBox = document.getElementById(targetId);
            
            if(!answerBox) return;

            if (answerBox.style.display === "block") {
                answerBox.style.display = "none";
                this.innerHTML = this.getAttribute('data-default-text') || 'View Solution';
            } else {
                answerBox.style.display = "block";
                this.innerHTML = 'Hide Solution';
            }
        });
    });
}

function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            const isExpanded = navLinks.style.display === 'flex';
            navLinks.style.display = isExpanded ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '4.5rem';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'var(--bg-glass)';
            navLinks.style.backdropFilter = 'blur(16px)';
            navLinks.style.padding = 'var(--space-md)';
            navLinks.style.borderBottom = 'var(--border-glass)';
        });
    }
}
