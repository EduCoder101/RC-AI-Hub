// Search functionality
let searchTimeout;
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const resultsHeader = document.getElementById('resultsHeader');
const resultsCount = document.getElementById('resultsCount');
const emptyState = document.getElementById('emptyState');
const noResults = document.getElementById('noResults');

// Initialize search on page load
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(this.value);
    }, 300); // Debounce search by 300ms
});

// Quick search function for tags
function quickSearch(term) {
    searchInput.value = term;
    performSearch(term);
    searchInput.focus();
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    performSearch('');
    searchInput.focus();
}

// Main search function
function performSearch(query) {
    const searchTerm = query.trim().toLowerCase();
    
    // If empty search, show empty state
    if (searchTerm === '') {
        showEmptyState();
        return;
    }
    
    // Check if searchData exists
    if (typeof searchData === 'undefined') {
        console.error('searchData is not defined!');
        displayResults([], searchTerm);
        return;
    }
    
    // Search through data
    const results = searchData.filter(strategy => {
        return matchesSearch(strategy, searchTerm);
    });
    
    // Sort by relevance
    results.sort((a, b) => {
        return calculateRelevance(b, searchTerm) - calculateRelevance(a, searchTerm);
    });
    
    // Display results
    displayResults(results, searchTerm);
}

// Check if strategy matches search term
function matchesSearch(strategy, searchTerm) {
    // Split search term into words for multi-word searches
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2); // Ignore words shorter than 3 chars
    
    // If it's a single word or phrase, do exact matching
    if (searchWords.length <= 1) {
        // Search in title
        if (strategy.title.toLowerCase().includes(searchTerm)) return true;
        
        // Search in description
        if (strategy.description.toLowerCase().includes(searchTerm)) return true;
        
        // Search in keywords
        if (strategy.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))) return true;
        
        // Search in when to use
        if (strategy.whenToUse.toLowerCase().includes(searchTerm)) return true;
        
        // Search in category
        if (strategy.category.toLowerCase().includes(searchTerm)) return true;
        
        return false;
    }
    
    // For multi-word searches, check if ANY word matches
    return searchWords.some(word => {
        return strategy.title.toLowerCase().includes(word) ||
               strategy.description.toLowerCase().includes(word) ||
               strategy.keywords.some(keyword => keyword.toLowerCase().includes(word)) ||
               strategy.whenToUse.toLowerCase().includes(word) ||
               strategy.category.toLowerCase().includes(word);
    });
}

// Calculate relevance score
function calculateRelevance(strategy, searchTerm) {
    let score = 0;
    
    // Title match is worth most
    if (strategy.title.toLowerCase().includes(searchTerm)) {
        score += 10;
        // Exact match is worth even more
        if (strategy.title.toLowerCase() === searchTerm) {
            score += 20;
        }
    }
    
    // Keyword matches
    const keywordMatches = strategy.keywords.filter(keyword => 
        keyword.toLowerCase().includes(searchTerm)
    ).length;
    score += keywordMatches * 5;
    
    // Description match
    if (strategy.description.toLowerCase().includes(searchTerm)) {
        score += 3;
    }
    
    // When to use match
    if (strategy.whenToUse.toLowerCase().includes(searchTerm)) {
        score += 2;
    }
    
    return score;
}

// Display results
function displayResults(results, searchTerm) {
    // Hide empty state
    emptyState.classList.remove('active');
    
    // Show results header
    resultsHeader.style.display = 'flex';
    
    if (results.length === 0) {
        // Show no results
        noResults.classList.add('active');
        resultsContainer.classList.remove('active');
        resultsCount.textContent = 'No strategies found';
        return;
    }
    
    // Hide no results, show results
    noResults.classList.remove('active');
    resultsContainer.classList.add('active');
    
    // Update count
    const plural = results.length === 1 ? 'strategy' : 'strategies';
    resultsCount.textContent = `Found ${results.length} ${plural}`;
    
    // Build results HTML
    resultsContainer.innerHTML = results.map(strategy => {
        return createResultCard(strategy, searchTerm);
    }).join('');
}

// Create a result card
function createResultCard(strategy, searchTerm) {
    // Find which field matched best
    let matchContext = '';
    const searchLower = searchTerm.toLowerCase();
    
    // Check keywords for matches
    const matchedKeywords = strategy.keywords.filter(keyword => 
        keyword.toLowerCase().includes(searchLower)
    );
    
    if (matchedKeywords.length > 0) {
        matchContext = `<div class="result-match"><strong>Related keywords:</strong> ${matchedKeywords.slice(0, 5).join(', ')}</div>`;
    }
    
    // Highlight search term in description and whenToUse
    const highlightedDescription = highlightText(strategy.description, searchTerm);
    const highlightedWhenToUse = highlightText(strategy.whenToUse, searchTerm);
    
    // Deep-link to specific strategy on the page
    const deepLink = `${strategy.link}#${strategy.id}`;
    
    return `
        <div class="result-card">
            <div class="result-header">
                <div class="result-title">
                    <h3>${highlightText(strategy.title, searchTerm)}</h3>
                    <p style="color: var(--text-light); font-size: 0.95rem; margin-bottom: 0.5rem;">${strategy.step}</p>
                </div>
                <div class="result-badge">${strategy.category}</div>
            </div>
            
            <div class="result-when-to-use">
                <strong>Use when:</strong> ${highlightedWhenToUse}
            </div>
            
            <div class="result-description">${highlightedDescription}</div>
            
            ${matchContext}
            
            <div style="margin-top: 1.5rem;">
                <a href="${deepLink}" class="result-link">View Strategy & Prompts →</a>
            </div>
        </div>
    `;
}

// Highlight search term in text
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Escape special regex characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Show empty state
function showEmptyState() {
    resultsHeader.style.display = 'none';
    resultsContainer.classList.remove('active');
    noResults.classList.remove('active');
    emptyState.classList.add('active');
}

// Focus search input on load
window.addEventListener('DOMContentLoaded', () => {
    searchInput.focus();
});
