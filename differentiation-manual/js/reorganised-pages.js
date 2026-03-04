// Toggle functions for reorganised pages

// Simple function to jump to and expand a strategy
function jumpToStrategy(strategyId) {
    const targetCard = document.getElementById(strategyId);
    
    if (targetCard) {
        const header = targetCard.querySelector('.strategy-header');
        const content = targetCard.querySelector('.strategy-content');
        
        if (header && content) {
            if (content.style.display === 'none' || !content.style.display) {
                header.click();
            }
            
            setTimeout(function() {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

function toggleTheoryBox(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.expand-icon');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.classList.add('rotated');
    } else {
        content.style.display = 'none';
        icon.classList.remove('rotated');
    }
}

// Function to expand and scroll to a strategy
function expandAndScrollToStrategy(strategyId) {
    const targetCard = document.querySelector(strategyId);
    if (targetCard && targetCard.classList.contains('strategy-card')) {
        const header = targetCard.querySelector('.strategy-header');
        const content = targetCard.querySelector('.strategy-content');
        
        if (header && content) {
            if (content.style.display === 'none' || !content.style.display) {
                header.click();
            }
            
            setTimeout(() => {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
}

// Inject "When to use" preview into collapsed strategy headers
function injectWhenToUsePreviews() {
    const cards = document.querySelectorAll('.strategy-card');
    cards.forEach((card, index) => {
        const whenToUse = card.querySelector('.when-to-use');
        const header = card.querySelector('.strategy-header');
        
        if (whenToUse && header) {
            // Extract just the text after "When to use:"
            let text = whenToUse.textContent.replace(/^When to use:\s*/i, '').trim();
            // Truncate if very long
            if (text.length > 120) {
                text = text.substring(0, 117) + '...';
            }
            
            const preview = document.createElement('div');
            preview.className = 'when-preview';
            preview.textContent = text;
            
            header.querySelector('.strategy-title').appendChild(preview);
        }

        // Fix strategy numbering: renumber sequentially starting from 1
        const numEl = card.querySelector('.strategy-number');
        if (numEl) {
            numEl.textContent = index + 1;
        }
    });
}

// Handle quick nav link clicks and hash navigation
document.addEventListener('DOMContentLoaded', function() {
    // Inject when-to-use previews
    injectWhenToUsePreviews();
    
    // Add click handlers to quick nav links
    const quickNavLinks = document.querySelectorAll('.quick-nav-link');
    
    quickNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            expandAndScrollToStrategy(targetId);
        });
    });
    
    // Handle direct anchor links (from randomiser or external)
    const hash = window.location.hash;
    if (hash) {
        setTimeout(() => {
            expandAndScrollToStrategy(hash);
        }, 300);
    }
});
