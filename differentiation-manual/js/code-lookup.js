/* ==========================================
   ADJUSTMENT CODE LOOKUP - JS
   Supports Classroom Adjustment Codes and
   High Potential Learner Adjustments
   ========================================== */

(function() {
    'use strict';

    // ---- State ----
    let selectedCodes = new Set();
    let activeMode = 'classroom'; // 'classroom' or 'hp'

    // ---- Classroom code categories ----
    const classroomCategories = [
        { name: 'Content', codes: ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13','C14'] },
        { name: 'Method / Process', codes: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17','M18'] },
        { name: 'Product', codes: ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12','P13'] },
        { name: 'Environment', codes: ['E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E13','E14'] },
        { name: 'Disability Provisions', codes: ['D1','D2','D3','D4','D5','D6','D7','D8'] },
    ];

    // ---- HP code categories ----
    const hpCategories = [
        { name: 'Complexity', codes: ['HP-CX1','HP-CX2','HP-CX3'] },
        { name: 'Challenge', codes: ['HP-CH1','HP-CH2','HP-CH3','HP-CH4'] },
        { name: 'Choice', codes: ['HP-CO1','HP-CO2','HP-CO3'] },
        { name: 'Pace', codes: ['HP-PA1','HP-PA2'] },
        { name: 'Learning Environment', codes: ['HP-LE1','HP-LE2','HP-LE3','HP-LE4'] },
    ];

    // Classroom codes that are operational (no strategy match)
    const operationalCodes = new Set([
        'C7','C13','C14','M7','M8','M15','M18','P8','P12','P13',
        'E5','E10','E11','E14','D1','D2','D4','D5','D6','D8'
    ]);

    // ---- Helpers ----
    function getShortDesc(code) {
        const desc = adjustmentCodes[code] || '';
        if (desc.length > 55) return desc.substring(0, 52) + '...';
        return desc;
    }

    function getCategories() {
        return activeMode === 'hp' ? hpCategories : classroomCategories;
    }

    function getStrategyField() {
        return activeMode === 'hp' ? 'hpAdjustments' : 'adjustmentCodes';
    }

    function isOperational(code) {
        return activeMode === 'classroom' && operationalCodes.has(code);
    }

    function truncate(str, len) {
        if (str.length <= len) return str;
        return str.substring(0, len).replace(/\s+\S*$/, '') + '...';
    }

    function capitalise(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ---- Render code selector ----
    function renderCodeSelector() {
        const container = document.getElementById('codeSelector');
        if (!container) return;

        const categories = getCategories();
        let html = '';
        categories.forEach(cat => {
            html += '<div class="code-category">';
            html += '<div class="code-category-header">' + cat.name + '</div>';
            html += '<div class="code-grid">';
            cat.codes.forEach(code => {
                const desc = getShortDesc(code);
                html += '<button class="code-chip" data-code="' + code + '">';
                html += '<span class="chip-code">' + code + '</span>';
                html += '<span class="chip-desc">' + desc + '</span>';
                html += '</button>';
            });
            html += '</div></div>';
        });
        container.innerHTML = html;

        // Attach listeners
        container.querySelectorAll('.code-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const code = chip.dataset.code;
                if (selectedCodes.has(code)) {
                    selectedCodes.delete(code);
                    chip.classList.remove('selected');
                } else {
                    selectedCodes.add(code);
                    chip.classList.add('selected');
                }
                updateResults();
            });
        });
    }

    // ---- Update results ----
    function updateResults() {
        updateSelectedSummary();
        updateUnmappedInfo();

        const resultsHeader = document.getElementById('resultsHeader');
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsHeader || !resultsContainer) return;

        if (selectedCodes.size === 0) {
            resultsHeader.innerHTML = '';
            resultsContainer.innerHTML = '<div class="results-empty">Select one or more codes above to see matching strategies</div>';
            return;
        }

        // Find matching strategies
        const field = getStrategyField();
        const matches = searchData
            .filter(s => s[field] && s[field].some(c => selectedCodes.has(c)))
            .map(s => {
                const matchedCodes = s[field].filter(c => selectedCodes.has(c));
                return { strategy: s, matchedCodes, matchCount: matchedCodes.length };
            })
            .sort((a, b) => b.matchCount - a.matchCount);

        if (matches.length === 0) {
            resultsHeader.innerHTML = 'No strategy matches for the selected codes';
            resultsContainer.innerHTML = '<div class="results-empty">The selected codes ' +
                (activeMode === 'classroom'
                    ? 'are operational adjustments that don\'t map directly to instructional strategies in this manual.'
                    : 'don\'t have matching strategies.') +
                '</div>';
            return;
        }

        resultsHeader.innerHTML = '<span class="match-count">' + matches.length + '</span> strategies match your selected codes';

        let html = '<div class="results-grid">';
        matches.forEach(m => {
            const s = m.strategy;
            const continuumBadge = getContinuumBadge(s);

            html += '<a href="' + s.link + '#' + s.id + '" class="result-card">';
            html += '<div class="card-header">';
            html += '<div class="card-title">' + s.title + '</div>';
            html += '<span class="card-step">' + s.category + '</span>';
            html += '</div>';
            html += '<div class="card-desc">' + truncate(s.description, 120) + '</div>';
            html += '<div class="matched-codes">';
            s[field].forEach(code => {
                const isHighlighted = selectedCodes.has(code);
                html += '<span class="matched-code-tag' + (isHighlighted ? ' highlighted' : '') + '">' + code + '</span>';
            });
            if (continuumBadge) html += continuumBadge;
            html += '</div>';
            html += '<span class="card-link">View strategy & prompts</span>';
            html += '</a>';
        });
        html += '</div>';
        resultsContainer.innerHTML = html;
    }

    function getContinuumBadge(s) {
        if (!s.continuumType || s.continuumType === 'excluded' || s.continuumType === 'equaliser') return '';
        if (s.continuumType === 'full-span') return '<span class="continuum-badge full-span">Full Span</span>';
        if (s.continuumPrimary) return '<span class="continuum-badge ' + s.continuumPrimary + '">' + capitalise(s.continuumPrimary) + '</span>';
        return '';
    }

    // ---- Selected summary bar ----
    function updateSelectedSummary() {
        const summary = document.getElementById('selectedSummary');
        const tagsContainer = document.getElementById('selectedTags');
        if (!summary || !tagsContainer) return;

        if (selectedCodes.size === 0) {
            summary.classList.remove('visible');
            return;
        }

        summary.classList.add('visible');
        let html = '';
        Array.from(selectedCodes).sort().forEach(code => {
            html += '<span class="selected-tag" data-code="' + code + '">' + code + '</span>';
        });
        html += '<button class="clear-all" id="clearAll">Clear all</button>';
        tagsContainer.innerHTML = html;

        // Attach remove listeners
        tagsContainer.querySelectorAll('.selected-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const code = tag.dataset.code;
                selectedCodes.delete(code);
                const chip = document.querySelector('.code-chip[data-code="' + code + '"]');
                if (chip) chip.classList.remove('selected');
                updateResults();
            });
        });

        const clearBtn = document.getElementById('clearAll');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                selectedCodes.clear();
                document.querySelectorAll('.code-chip.selected').forEach(c => c.classList.remove('selected'));
                updateResults();
            });
        }
    }

    // ---- Unmapped codes info ----
    function updateUnmappedInfo() {
        const infoBox = document.getElementById('unmappedInfo');
        const listEl = document.getElementById('unmappedList');
        if (!infoBox || !listEl) return;

        const unmapped = Array.from(selectedCodes).filter(c => isOperational(c));
        if (unmapped.length === 0) {
            infoBox.style.display = 'none';
            return;
        }

        infoBox.style.display = 'block';
        listEl.innerHTML = unmapped.sort().map(c =>
            '<strong>' + c + '</strong>: ' + (adjustmentCodes[c] || '')
        ).join(' &middot; ');
    }

    // ---- Mode switching ----
    function initModeSwitcher() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newMode = btn.dataset.mode;
                if (newMode === activeMode) return;

                activeMode = newMode;
                selectedCodes.clear();

                // Update button states
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Re-render
                renderCodeSelector();
                updateResults();
            });
        });
    }

    // ---- Init ----
    function init() {
        initModeSwitcher();
        renderCodeSelector();
        updateResults();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
