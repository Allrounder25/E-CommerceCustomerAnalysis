document.addEventListener('DOMContentLoaded', () => {
    
    // --- Global Selections ---
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    const allPageSections = document.querySelectorAll('.page-section');
    const allSteps = document.querySelectorAll('.stepper .step');
    const allTabButtons = document.querySelectorAll('.tab-btn');
    const modelTemplates = document.getElementById('model-templates');
    
    // Model-specific content areas
    const regressionArea = document.getElementById('regression-content-area');
    const classificationArea = document.getElementById('classification-content-area');
    const unsupervisedArea = document.getElementById('unsupervised-content-area');

    let currentStep = 0;
    const TOTAL_STEPS = allPageSections.length;

    // --- Utility Functions ---

    /**
     * Updates the main page view to show the correct step.
     */
    function updateUI() {
        // 1. Update Page Sections
        allPageSections.forEach((section, index) => {
            section.style.display = (index === currentStep) ? 'block' : 'none';
        });

        // 2. Update Stepper
        allSteps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('active'); // Mark past steps as active
            } else if (index === currentStep) {
                step.classList.add('active'); // Mark current step
            } else {
                step.classList.remove('active'); // Unmark future steps
            }
        });
        
        // 3. Update Navigation Buttons
        prevBtn.style.display = (currentStep === 0) ? 'none' : 'inline-block';
        nextBtn.style.display = (currentStep === TOTAL_STEPS - 1) ? 'none' : 'inline-block';

        // 4. On first load of a step, click the first model card
        if (currentStep === 2 && !regressionArea.innerHTML) { // Regression
            document.querySelector('#regression-scroller .model-card').click();
        }
        if (currentStep === 3 && !classificationArea.innerHTML) { // Classification
            document.querySelector('#classification-scroller .model-card').click();
        }
        if (currentStep === 4 && !unsupervisedArea.innerHTML) { // Unsupervised
            document.querySelector('#unsupervised-scroller .model-card').click();
        }

        // 5. Load any dynamic content for the current step
        loadDynamicContent(allPageSections[currentStep]);
    }

    /**
     * Loads dynamic content (HTML tables, text) from the /images/ folder.
     */
    function loadDynamicContent(currentSection) {
        const tables = currentSection.querySelectorAll('.table-container[data-src]');
        tables.forEach(table => {
            const url = table.getAttribute('data-src');
            if (table.getAttribute('data-loaded') !== 'true') {
                fetch(url)
                    .then(response => response.text())
                    .then(html => {
                        table.innerHTML = html;
                        table.setAttribute('data-loaded', 'true');
                    })
                    .catch(err => {
                        table.innerHTML = `<p style="color: red;">Error loading ${url}</p>`;
                        console.error('Failed to load content:', err);
                    });
            }
        });

        const texts = currentSection.querySelectorAll('.table-container[data-src-text]');
        texts.forEach(textEl => {
             const url = textEl.getAttribute('data-src-text');
            if (textEl.getAttribute('data-loaded') !== 'true') {
                fetch(url)
                    .then(response => response.text())
                    .then(text => {
                        textEl.textContent = text;
                        textEl.setAttribute('data-loaded', 'true');
                    })
                    .catch(err => {
                        textEl.textContent = `Error loading ${url}`;
                        console.error('Failed to load content:', err);
                    });
            }
        });
    }

    /**
     * Handles clicks on the main "Code", "Output", "Analysis" tabs.
     */
    function handleTabClick(event) {
        const clickedTab = event.currentTarget;
        const tabName = clickedTab.dataset.tab;
        const stepId = clickedTab.closest('.option-bar').dataset.stepId;
        const pageSection = document.getElementById(`step-${stepId}`);

        // 1. Update Tab Buttons
        clickedTab.parentElement.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');

        // 2. Update Content Boxes
        // This is tricky because model tabs are nested.
        // We select the *closest* content-area to the tab bar.
        const contentArea = clickedTab.closest('.page-section, .model-content-container').querySelector('.content-area');
        
        contentArea.querySelectorAll('.content-box').forEach(box => {
            box.style.display = 'none';
            box.classList.remove('active');
        });
        
        const activeContent = contentArea.querySelector(`[data-tab="${tabName}"]`);
        if (activeContent) {
            activeContent.style.display = 'block';
            activeContent.classList.add('active');
        }
    }

    /**
     * Handles clicks on the horizontal model scroller cards.
     */
    function handleModelCardClick(event, contentTargetArea) {
        const clickedCard = event.currentTarget;
        const modelId = clickedCard.dataset.model;
        
        // 1. Update Card 'active' state
        clickedCard.parentElement.querySelectorAll('.model-card').forEach(card => card.classList.remove('active'));
        clickedCard.classList.add('active');
        
        // 2. Get the template content
        const template = modelTemplates.querySelector(`[data-model-id="${modelId}"]`);
        if (template) {
            contentTargetArea.innerHTML = template.innerHTML;
            
            // 3. Re-bind tab-click events for the new tabs
            contentTargetArea.querySelectorAll('.tab-btn').forEach(btn => {
                // This is a simple re-implementation of handleTabClick for nested tabs
                btn.addEventListener('click', (e) => {
                    const tabName = e.currentTarget.dataset.tab;
                    const parent = e.currentTarget.closest('.option-bar');
                    
                    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    
                    const contentArea = contentTargetArea; // Use the specific model area
                    contentArea.querySelectorAll('.content-box').forEach(box => {
                        box.style.display = 'none';
                        box.classList.remove('active');
                    });
                    
                    const activeContent = contentArea.querySelector(`[data-tab="${tabName}"]`);
                    if (activeContent) {
                        activeContent.style.display = 'block';
                        activeContent.classList.add('active');
                    }
                });
            });

            // 4. Click the first tab by default
            if(contentTargetArea.querySelector('.tab-btn')) {
                contentTargetArea.querySelector('.tab-btn').click();
            }

            // 5. Load dynamic content for this model
            loadDynamicContent(contentTargetArea);

        } else {
            contentTargetArea.innerHTML = `<p>Content for ${modelId} not found.</p>`;
        }
    }
    
    // --- Event Listeners ---

    // 1. Navigation
    nextBtn.addEventListener('click', () => {
        if (currentStep < TOTAL_STEPS - 1) {
            currentStep++;
            updateUI();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    allSteps.forEach(step => {
        step.addEventListener('click', () => {
            currentStep = parseInt(step.dataset.step);
            updateUI();
        });
    });

    // 2. Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // 3. Load Theme from LocalStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '☀️';
    }

    // 4. Main Tab Buttons (Code, Output, Analysis)
    allTabButtons.forEach(btn => {
        btn.addEventListener('click', handleTabClick);
    });
    
    // 5. Model Scroller Card Clicks
    document.querySelectorAll('#regression-scroller .model-card').forEach(card => {
        card.addEventListener('click', (e) => handleModelCardClick(e, regressionArea));
    });
    
    document.querySelectorAll('#classification-scroller .model-card').forEach(card => {
        card.addEventListener('click', (e) => handleModelCardClick(e, classificationArea));
    });
    
    document.querySelectorAll('#unsupervised-scroller .model-card').forEach(card => {
        card.addEventListener('click', (e) => handleModelCardClick(e, unsupervisedArea));
    });

    // --- Initial Load ---
    updateUI();
});