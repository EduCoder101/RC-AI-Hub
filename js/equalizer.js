// ==========================================
// EQUALIZER ACCORDION FUNCTIONALITY
// ==========================================

function toggleContinuum(headerElement) {
    const card = headerElement.closest('.continuum-card');
    const wasExpanded = card.classList.contains('expanded');
    
    // Optional: Close all other continuum cards (accordion style)
    // Comment out these lines if you want multiple cards open at once
    // const allCards = document.querySelectorAll('.continuum-card');
    // allCards.forEach(c => c.classList.remove('expanded'));
    
    // Toggle the clicked card
    if (wasExpanded) {
        card.classList.remove('expanded');
    } else {
        card.classList.add('expanded');
    }
}

// Initialize - optionally expand first continuum on page load
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment to have first continuum open by default
    // const firstCard = document.querySelector('.continuum-card');
    // if (firstCard) {
    //     firstCard.classList.add('expanded');
    // }
    
    // Add keyboard accessibility
    const headers = document.querySelectorAll('.continuum-header');
    headers.forEach(header => {
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
        
        header.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleContinuum(this);
                
                // Update aria-expanded
                const card = this.closest('.continuum-card');
                const isExpanded = card.classList.contains('expanded');
                this.setAttribute('aria-expanded', isExpanded);
            }
        });
    });
});
