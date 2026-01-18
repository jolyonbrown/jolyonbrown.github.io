(function() {
  'use strict';

  const WORKER_URL = 'https://jolyon-cv-chat.jolyon-ea8.workers.dev';

  // Context prompts for each role
  const CONTEXT_PROMPTS = {
    nhs: "Give me the detailed STAR-format story behind Jolyon's NHS England work. What was the situation, what tasks did he handle, what actions did he take, and what were the results? Be specific about the scale and impact.",
    tsys: "Give me the detailed STAR-format story behind Jolyon's TSYS work. Include specifics about the payment processing infrastructure, the Brazil deployment, and key achievements.",
    hbos: "Give me the detailed STAR-format story behind Jolyon's HBOS work. How did he progress from junior admin to senior developer? What were the key projects like Intelligent Finance and esure?",
    linuxformat: "Tell me about Jolyon's technical writing for Linux Format magazine. What made his coverage of Kubernetes, Prometheus, and Docker notable? What was the impact of covering these technologies early?"
  };

  // Fit Check Tab handling
  const fitTabs = document.querySelectorAll('.cv-fit-tab');
  const fitPanels = document.querySelectorAll('.cv-fit-panel');

  fitTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      fitTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      fitPanels.forEach(panel => {
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  // Context Toggle handling
  const contextToggles = document.querySelectorAll('.cv-context-toggle');

  contextToggles.forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const role = toggle.dataset.role;
      const panel = document.getElementById(`context-${role}`);

      if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        toggle.classList.remove('active');
        return;
      }

      toggle.classList.add('active');
      panel.classList.add('active');

      // If already loaded, just show it
      if (panel.dataset.loaded) {
        return;
      }

      // Show loading state
      panel.innerHTML = '<p class="loading">Loading AI context...</p>';

      try {
        const response = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: CONTEXT_PROMPTS[role],
            type: 'context'
          })
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        panel.innerHTML = formatResponse(data.response);
        panel.dataset.loaded = 'true';

      } catch (error) {
        panel.innerHTML = '<p class="loading">Unable to load context. Please try again.</p>';
        console.error('Context error:', error);
      }
    });
  });

  // Fit Check handling
  const analyzeBtn = document.getElementById('analyze-fit');
  const jobDescInput = document.getElementById('job-description');
  const fitResult = document.getElementById('fit-result');

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      const jobDesc = jobDescInput.value.trim();

      if (!jobDesc) {
        alert('Please paste a job description to analyze.');
        return;
      }

      analyzeBtn.disabled = true;
      analyzeBtn.textContent = 'Analyzing...';
      fitResult.innerHTML = '<p class="loading">Analyzing fit...</p>';
      fitResult.classList.remove('hidden');

      try {
        const response = await fetch(WORKER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: jobDesc,
            type: 'fit-check'
          })
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        fitResult.innerHTML = formatFitResponse(data.response);

      } catch (error) {
        fitResult.innerHTML = '<p class="loading">Unable to analyze. Please try again.</p>';
        console.error('Fit check error:', error);
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Fit';
      }
    });
  }

  function formatResponse(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  function formatFitResponse(content) {
    // Determine if it's a strong or weak fit based on content
    const isStrongFit = content.toLowerCase().includes("strong fit") ||
                        content.toLowerCase().includes("good fit") ||
                        content.toLowerCase().includes("let's talk") ||
                        content.toLowerCase().includes("aligns well");

    const className = isStrongFit ? 'cv-fit-strong-match' : 'cv-fit-weak-match';
    const icon = isStrongFit ? '✓' : '⚠';
    const title = isStrongFit ? 'Strong Match — Let\'s Talk' : 'Honest Assessment';

    return `
      <div class="cv-fit-assessment ${className}">
        <h4>${icon} ${title}</h4>
        ${formatResponse(content)}
      </div>
    `;
  }

  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();

// Global function to open chat widget (called from hero button)
function toggleChat() {
  const chatToggle = document.getElementById('chat-toggle');
  if (chatToggle) {
    chatToggle.click();
  }
}
