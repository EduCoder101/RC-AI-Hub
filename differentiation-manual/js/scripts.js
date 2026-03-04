// ==========================================
// DIFFERENTIATION MANUAL - INTERACTIVE SCRIPTS
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Card Flip Functionality
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        
        // Keyboard accessibility
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
            }
        });
    });
    
    // Toggle collapsible strategies
    function toggleStrategy(header) {
        const card = header.closest('.strategy-card');
        card.classList.toggle('expanded');
    }
    
    // Toggle collapsible prompt cards (for steps 1 & 2)
    function togglePromptCard(header) {
        const card = header.closest('.prompt-card');
        card.classList.toggle('expanded');
    }
    
    // Make toggle functions globally available
    window.toggleStrategy = toggleStrategy;
    window.togglePromptCard = togglePromptCard;
    
    // Smooth scroll for internal links
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
