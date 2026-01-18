(function() {
  'use strict';

  // Configuration
  const WORKER_URL = 'https://jolyon-cv-chat.jolyon-ea8.workers.dev';

  // State
  let isOpen = false;
  let history = [];
  let isLoading = false;

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
      <button id="chat-toggle" aria-label="Chat with AI">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Ask AI about me</span>
      </button>
      <div id="chat-panel" class="hidden">
        <div id="chat-header">
          <span>Chat with Jolyon's AI</span>
          <button id="chat-close" aria-label="Close chat">&times;</button>
        </div>
        <div id="chat-messages"></div>
        <div id="chat-suggestions">
          <button class="suggestion">What's your background?</button>
          <button class="suggestion">Tell me about NHS work</button>
          <button class="suggestion">Why ML infrastructure?</button>
          <button class="suggestion">What are your gaps?</button>
        </div>
        <div id="chat-input-area">
          <input type="text" id="chat-input" placeholder="Ask me anything..." autocomplete="off">
          <button id="chat-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    // Bind events
    document.getElementById('chat-toggle').addEventListener('click', toggleChat);
    document.getElementById('chat-close').addEventListener('click', toggleChat);
    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Suggestion buttons
    document.querySelectorAll('.suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = btn.textContent;
        sendMessage();
      });
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    const panel = document.getElementById('chat-panel');
    const toggle = document.getElementById('chat-toggle');

    if (isOpen) {
      panel.classList.remove('hidden');
      toggle.classList.add('hidden');
      document.getElementById('chat-input').focus();

      // Add welcome message if first open
      if (history.length === 0) {
        addMessage('assistant', "Hi! I'm an AI that can answer questions about Jolyon's experience, skills, and background. What would you like to know?");
      }
    } else {
      panel.classList.add('hidden');
      toggle.classList.remove('hidden');
    }
  }

  function addMessage(role, content) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = formatMessage(content);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    // Hide suggestions after first user message
    if (role === 'user') {
      document.getElementById('chat-suggestions').style.display = 'none';
    }
  }

  function formatMessage(content) {
    // Basic markdown-ish formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function showLoading() {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message assistant loading';
    div.id = 'loading-message';
    div.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideLoading() {
    const loading = document.getElementById('loading-message');
    if (loading) loading.remove();
  }

  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message || isLoading) return;

    input.value = '';
    addMessage('user', message);

    isLoading = true;
    showLoading();
    document.getElementById('chat-send').disabled = true;

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      hideLoading();

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Update history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: data.response });

      addMessage('assistant', data.response);

    } catch (error) {
      hideLoading();
      addMessage('assistant', "Sorry, I'm having trouble connecting. Please try again in a moment.");
      console.error('Chat error:', error);
    } finally {
      isLoading = false;
      document.getElementById('chat-send').disabled = false;
      document.getElementById('chat-input').focus();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
