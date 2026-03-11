/* ==========================================
   DIFFERENTIATION CONTINUUM - JS
   ========================================== */

(function() {
    'use strict';

    // ---- State ----
    let activePosition = 'all';
    let activeCategories = new Set();
    let activeTaskTypes = new Set();

    // ---- Data helpers ----
    function getColumnStrategies(position) {
        return searchData.filter(s =>
            (s.continuumType === 'fixed' || s.continuumType === 'flexible') &&
            s.continuumPrimary === position
        );
    }

    function getFullSpanStrategies() {
        return searchData.filter(s => s.continuumType === 'full-span');
    }

    function getEqualiserStrategies() {
        return searchData.filter(s => s.continuumType === 'equaliser');
    }

    // ---- Card HTML builders ----
    function buildStrategyCard(strategy, cardClass) {
        const typeLabel = getTypeLabel(strategy);
        const typeBadgeClass = getTypeBadgeClass(strategy);

        return `
            <a href="${strategy.link}#${strategy.id}" class="continuum-card ${cardClass}" data-strategy-id="${strategy.id}" data-category="${strategy.category}" data-positions="${strategy.continuumPosition.join(',')}">
                <div class="card-badges">
                    <span class="badge badge-category">${strategy.category}</span>
                    <span class="badge badge-type ${typeBadgeClass}">${typeLabel}</span>
                </div>
                <div class="card-title">${strategy.title}</div>
                <div class="card-note">${strategy.continuumNote}</div>
                <span class="card-link">View strategy & prompts</span>
            </a>
        `;
    }

    function getTypeLabel(strategy) {
        if (strategy.continuumType === 'fixed') return 'Fixed';
        if (strategy.continuumType === 'flexible') return 'Flexible ↔';
        if (strategy.continuumType === 'full-span') return 'Full Span';
        return strategy.continuumType;
    }

    function getTypeBadgeClass(strategy) {
        if (strategy.continuumType === 'fixed') {
            if (strategy.continuumPrimary === 'foundations') return 'fixed-foundations';
            if (strategy.continuumPrimary === 'core') return 'fixed-core';
            if (strategy.continuumPrimary === 'extension') return 'fixed-extension';
        }
        if (strategy.continuumType === 'flexible') return 'flexible';
        if (strategy.continuumType === 'full-span') return 'full-span';
        return '';
    }

    function buildEqualiserCard(strategy) {
        // Parse dimension from title (e.g., "Concrete ↔ Abstract")
        const parts = strategy.title.split(' ↔ ');
        const leftLabel = parts[0] || '';
        const rightLabel = parts[1] || '';

        return `
            <a href="${strategy.link}#${strategy.id}" class="equaliser-card" data-strategy-id="${strategy.id}">
                <div class="eq-title">${strategy.title}</div>
                <div class="eq-scale">
                    <span class="scale-label left">${leftLabel}</span>
                    <div class="scale-bar"></div>
                    <span class="scale-label right">${rightLabel}</span>
                </div>
                <div class="eq-note">${strategy.continuumNote}</div>
                <span class="card-link">View prompt</span>
            </a>
        `;
    }

    // ---- Render ----
    function renderContinuum() {
        const positions = ['foundations', 'core', 'extension'];
        const cardClasses = {
            foundations: 'foundations-card',
            core: 'core-card',
            extension: 'extension-card'
        };

        // Render three columns (desktop)
        positions.forEach(pos => {
            const strategies = getColumnStrategies(pos);
            const container = document.getElementById(pos + 'Cards');
            if (container) {
                container.innerHTML = strategies.map(s =>
                    buildStrategyCard(s, cardClasses[pos])
                ).join('');
            }
        });

        // Render mobile tabs
        positions.forEach(pos => {
            const strategies = getColumnStrategies(pos);
            const panel = document.getElementById('tab-' + pos);
            if (panel) {
                panel.innerHTML = strategies.map(s =>
                    buildStrategyCard(s, cardClasses[pos])
                ).join('');
            }
        });

        // Render Full Span
        const fullSpan = getFullSpanStrategies();
        const fullSpanContainer = document.getElementById('fullSpanCards');
        if (fullSpanContainer) {
            fullSpanContainer.innerHTML = fullSpan.map(s =>
                buildStrategyCard(s, 'fullspan-card')
            ).join('');
        }

        // Render Equaliser
        const equalisers = getEqualiserStrategies();
        const eqContainer = document.getElementById('equaliserCards');
        if (eqContainer) {
            // Individual dimension cards
            let html = equalisers.map(s => buildEqualiserCard(s)).join('');

            // Summary card (the overall Equaliser prompt from step5)
            html += `
                <a href="step5-equalizer.html" class="equaliser-card equaliser-summary-card">
                    <div class="eq-title">⭐ Use All Dimensions Together</div>
                    <div class="eq-note">Apply the full Equaliser to create foundations, core, and extension versions of any task in one step.</div>
                    <span class="card-link">View the full Equaliser</span>
                </a>
            `;

            eqContainer.innerHTML = html;
        }

        // Update count
        updateCount();
    }

    // ---- Filtering ----
    function applyFilters() {
        const allCards = document.querySelectorAll('.continuum-card');

        allCards.forEach(card => {
            const strategyId = card.dataset.strategyId;
            const strategy = searchData.find(s => s.id === strategyId);
            if (!strategy) return;

            const matchesPosition = activePosition === 'all' ||
                strategy.continuumPosition.includes(activePosition) ||
                strategy.continuumType === 'full-span';

            const matchesCategory = activeCategories.size === 0 ||
                activeCategories.has(strategy.category);

            // Check task type match (if strategy has taskTypes field)
            const matchesTaskType = activeTaskTypes.size === 0 ||
                (strategy.taskTypes && strategy.taskTypes.some(t => activeTaskTypes.has(t)));

            const shouldDim = !(matchesPosition && matchesCategory && matchesTaskType);
            card.classList.toggle('dimmed', shouldDim);
        });

        updateCount();
    }

    function updateCount() {
        const el = document.getElementById('strategyCount');
        if (!el) return;

        const visible = document.querySelectorAll('.continuum-card:not(.dimmed)');
        const total = document.querySelectorAll('.continuum-card');
        const showing = visible.length;

        if (activePosition === 'all' && activeCategories.size === 0 && activeTaskTypes.size === 0) {
            el.innerHTML = `Showing all <span class="count-number">${total.length}</span> strategies on the continuum`;
        } else {
            el.innerHTML = `Showing <span class="count-number">${showing}</span> of ${total.length} strategies`;
        }
    }

    // ---- Event handlers ----
    function initFilters() {
        // Position filter pills
        document.querySelectorAll('.filter-pill[data-position]').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill[data-position]').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activePosition = pill.dataset.position;
                applyFilters();
            });
        });

        // Category filter pills
        document.querySelectorAll('.filter-pill.category-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const cat = pill.dataset.category;
                if (activeCategories.has(cat)) {
                    activeCategories.delete(cat);
                    pill.classList.remove('active');
                } else {
                    activeCategories.add(cat);
                    pill.classList.add('active');
                }
                applyFilters();
            });
        });

        // Task type filter pills
        document.querySelectorAll('.filter-pill.task-type-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                const taskType = pill.dataset.tasktype;
                if (activeTaskTypes.has(taskType)) {
                    activeTaskTypes.delete(taskType);
                    pill.classList.remove('active');
                } else {
                    activeTaskTypes.add(taskType);
                    pill.classList.add('active');
                }
                applyFilters();
            });
        });

        // Mobile category toggle
        const catToggle = document.getElementById('categoryToggle');
        const catRow = document.getElementById('categoryFiltersRow');
        if (catToggle && catRow) {
            catToggle.addEventListener('click', () => {
                catRow.classList.toggle('show');
                catToggle.textContent = catRow.classList.contains('show')
                    ? 'Hide categories'
                    : 'Filter by category';
            });
        }
    }

    function initMobileTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                // Update buttons
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update panels
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById('tab-' + tab);
                if (panel) panel.classList.add('active');
            });
        });
    }

    function initStickyFilter() {
        const filterBar = document.getElementById('filterBar');
        if (!filterBar) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                filterBar.classList.toggle('stuck', !entry.isIntersecting);
            },
            { threshold: 1, rootMargin: '-1px 0px 0px 0px' }
        );

        // Create a sentinel element above the filter bar
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        filterBar.parentNode.insertBefore(sentinel, filterBar);
        observer.observe(sentinel);
    }

    // ---- Init ----
    function init() {
        renderContinuum();
        initFilters();
        initMobileTabs();
        initStickyFilter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
