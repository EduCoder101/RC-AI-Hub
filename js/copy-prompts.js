// ==========================================
// COPY PROMPTS FUNCTIONALITY
// ==========================================

function copyPrompt(button) {
    // Find the prompt container - works with both page structures:
    // Steps 1-2 use .prompt-card > .prompt-container
    // Steps 3-7 use .prompt-section > .prompt-container
    const wrapper = button.closest('.prompt-section') || button.closest('.prompt-card');
    const promptBox = wrapper.querySelector('.prompt-container');
    
    // Get the text content
    const textToCopy = promptBox.innerText;
    
    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Change button text and style
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        button.textContent = 'Copy failed';
        setTimeout(() => {
            button.textContent = 'Copy Prompt';
        }, 2000);
    });
}

// Alternative: Select text on click for manual copy
document.addEventListener('DOMContentLoaded', function() {
    const promptBoxes = document.querySelectorAll('.prompt-container');
    
    promptBoxes.forEach(box => {
        box.style.cursor = 'pointer';
        box.setAttribute('title', 'Click to select all text');
        
        box.addEventListener('click', function() {
            const range = document.createRange();
            range.selectNodeContents(this);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });
    });
});
