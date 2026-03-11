// Randomiser for "Try These First" section
// Uses the searchData array from search-data.js

// Function to get random strategies
function getRandomStrategies(count = 3) {
    const strategiesCopy = [...searchData];
    
    // Shuffle array using Fisher-Yates algorithm
    for (let i = strategiesCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [strategiesCopy[i], strategiesCopy[j]] = [strategiesCopy[j], strategiesCopy[i]];
    }
    
    return strategiesCopy.slice(0, count);
}

// Function to render strategy cards
function renderRandomStrategies() {
    const container = document.getElementById('randomStrategies');
    if (!container) return;
    
    const strategies = getRandomStrategies(3);
    
    container.innerHTML = strategies.map(strategy => {
        const strategyLink = `${strategy.link}#${strategy.id}`;
        const whenText = strategy.whenToUse || 'A versatile differentiation approach';
        
        return `
            <div class="random-strategy-card" onclick="window.location.href='${strategyLink}'">
                <span class="strategy-category-badge">${strategy.category}</span>
                <h3>${strategy.title}</h3>
                <p class="strategy-when"><strong>Use when:</strong> ${whenText}</p>
                <p class="strategy-desc">${strategy.description.substring(0, 150)}${strategy.description.length > 150 ? '...' : ''}</p>
                <a href="${strategyLink}" class="view-strategy-btn">View Strategy & AI Prompts →</a>
            </div>
        `;
    }).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof searchData === 'undefined') return;
    
    renderRandomStrategies();
    
    const refreshBtn = document.getElementById('refreshStrategies');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const container = document.getElementById('randomStrategies');
            if (container) {
                container.style.opacity = '0';
                container.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    renderRandomStrategies();
                    container.style.opacity = '1';
                }, 200);
            }
        });
    }
});
