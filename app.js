document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTION ---
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.page-section');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const themeToggle = document.getElementById('theme-toggle');
    let currentStep = 0;

    // --- UI NAVIGATION LOGIC ---
    const updateUI = () => {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        sections.forEach((section, index) => {
            section.style.display = index === currentStep ? 'block' : 'none';
            // Re-trigger animation by removing and adding the class
            if (index === currentStep) {
                section.classList.remove('active-section');
                void section.offsetWidth; // Trigger reflow
                section.classList.add('active-section');
            } else {
                section.classList.remove('active-section');
            }
        });

        prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-block';
        nextBtn.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next Step';
        if (currentStep === steps.length - 1) {
            nextBtn.onclick = () => alert('Project demonstration complete!');
        } else {
            nextBtn.onclick = () => {
                currentStep++;
                updateUI();
            };
        }
    };

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateUI();
        }
    });

    steps.forEach(step => {
        step.addEventListener('click', () => {
            currentStep = parseInt(step.dataset.step);
            updateUI();
        });
    });

    // --- DYNAMIC CONTENT & TAB INITIALIZATION ---
    const initializeScroller = (scrollerId, contentAreaId, templatesContainer) => {
        const scroller = document.getElementById(scrollerId);
        const contentArea = document.getElementById(contentAreaId);

        scroller.addEventListener('click', (e) => {
            if (e.target.classList.contains('model-card')) {
                // Update active card
                scroller.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');

                const modelId = e.target.dataset.model;
                const template = templatesContainer.querySelector(`[data-model-id="${modelId}"]`);
                if (template) {
                    contentArea.innerHTML = template.innerHTML;
                    // Re-initialize tab buttons for the new content
                    initializeTabButtons(contentArea);
                }
            }
        });
        // Load the first model's content by default
        scroller.querySelector('.model-card').click();
    };

    const initializeTabButtons = (parent) => {
        const tabBtns = parent.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const optionBar = btn.closest('.option-bar');
                const contentArea = optionBar.nextElementSibling;

                if (!contentArea || !contentArea.classList.contains('content-area')) {
                    console.error('Could not find a .content-area sibling to the .option-bar');
                    return;
                }

                const activeTab = btn.dataset.tab;

                optionBar.querySelector('.tab-btn.active')?.classList.remove('active');
                btn.classList.add('active');

                contentArea.querySelectorAll('.content-box').forEach(box => {
                    box.classList.toggle('active', box.dataset.tab === activeTab);
                });
            });
        });
    };

    const templatesContainer = document.getElementById('model-templates');
    document.querySelectorAll('.page-section').forEach(section => {
        initializeTabButtons(section);
    });

    const loadStaticContent = () => {
        document.querySelectorAll('[data-src]').forEach(el => {
            fetch(el.dataset.src)
                .then(response => response.text())
                .then(data => { el.innerHTML = data; })
                .catch(error => { el.innerHTML = `Error loading content.`; });
        });
        document.querySelectorAll('[data-src-text]').forEach(el => {
            fetch(el.dataset.srcText)
                .then(response => response.text())
                .then(data => { el.innerHTML = `<pre><code>${data}</code></pre>`; })
                .catch(error => { el.innerHTML = `Error loading content.`; });
        });
        document.querySelectorAll('[data-src-json]').forEach(el => {
            fetch(el.dataset.srcJson)
                .then(response => response.json())
                .then(data => {
                    let tableHtml = '<table><thead><tr><th>Model</th><th>R2/Accuracy</th><th>MSE/F1-Score</th></tr></thead><tbody>';
                    for (const model in data) {
                        const metrics = Object.values(data[model]);
                        tableHtml += `<tr><td>${model}</td><td>${metrics[0].toFixed(4)}</td><td>${metrics[3].toFixed(4)}</td></tr>`;
                    }
                    tableHtml += '</tbody></table>';
                    el.innerHTML = tableHtml;
                })
                .catch(error => { el.innerHTML = `Error loading JSON.`; });
        });
    };

    // --- Theme Toggler ---
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
    });

    // --- INITIALIZATION ---
    initializeScroller('regression-scroller', 'regression-content-area', templatesContainer);
    initializeScroller('classification-scroller', 'classification-content-area', templatesContainer);
    updateUI();
    loadStaticContent();
});