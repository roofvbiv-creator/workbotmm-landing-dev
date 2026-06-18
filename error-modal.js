// Error Modal - Universal Modal for displaying errors
// Usage: Call showErrorModal(title, message) from any page
// VERSION: 1.8 - 2026-06-17 with detailed logging

const ErrorModal = {
  // Initialize modal
  init() {
    const modal = document.getElementById('error-modal');
    if (!modal) {
      this.createModal();
    }
    this.attachEventListeners();
  },

  // Create modal HTML structure
  createModal() {
    const modalHTML = `
      <div id="error-modal" class="error-modal">
        <div class="error-modal-content">
          <div class="error-modal-icon">⚠️</div>
          <div class="error-modal-title">შეცდომა მოხდა</div>
          <div class="error-modal-message"></div>
          <div id="error-modal-input-container" style="display: none;">
            <input type="text" id="error-modal-input" class="error-modal-input" placeholder="პასუხი ჩაწერე...">
          </div>
          <div class="error-modal-buttons">
            <button class="error-modal-btn error-modal-btn-close" onclick="ErrorModal.close()">
              დახურვა
            </button>
            <button id="error-modal-submit" class="error-modal-btn error-modal-btn-submit" style="display: none;" onclick="ErrorModal.submitResponse()">
              გაგზავნა
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Attach event listeners
  attachEventListeners() {
    const modal = document.getElementById('error-modal');
    if (!modal) return;

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.close();
      }
    });
  },

  // Show modal with custom message
  show(title = 'შეცდომა მოხდა', message = '', isCustom = false, linkId = null) {
    const modal = document.getElementById('error-modal');
    if (!modal) {
      this.init();
    }

    const titleEl = modal.querySelector('.error-modal-title');
    const messageEl = modal.querySelector('.error-modal-message');
    const inputContainer = document.getElementById('error-modal-input-container');
    const submitBtn = document.getElementById('error-modal-submit');
    const input = document.getElementById('error-modal-input');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    // Show/hide input field and submit button based on isCustom
    if (isCustom && inputContainer && submitBtn) {
      inputContainer.style.display = 'block';
      submitBtn.style.display = 'block';
      input.value = '';
      input.focus();
      // Store link_id for later use when submitting
      this.currentLinkId = linkId;
    } else {
      if (inputContainer) inputContainer.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'none';
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  // Close modal
  close() {
    const modal = document.getElementById('error-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  // Polling function to check for errors from backend
  startPolling(linkId, pageType = 'orders', intervalMs = 3000) {
    if (!linkId) {
      console.warn('ErrorModal.startPolling: linkId is required');
      return;
    }

    // Initial setup
    this.init();
    this.pollingInterval = setInterval(() => {
      this.checkForError(linkId, pageType);
    }, intervalMs);

    console.log(`✅ Error polling started for link_id=${linkId}, page_type=${pageType}`);
  },

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('❌ Error polling stopped');
    }
  },

  // Check for error from backend
  async checkForError(linkId, pageType = 'orders') {
    try {
      const BASE_URL = 'https://mmworkbot-dev-production.up.railway.app';
      const response = await fetch(`${BASE_URL}/error/${linkId}?page_type=${pageType}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data && data.error_text) {
        // Error found - check if it's custom error
        const isCustom = data.is_custom || false;

        // Show error with optional input field
        this.show('❌ შეცდომა მოხდა', data.error_text, isCustom, linkId);

        // Mark as read (optional - delete after showing)
        await fetch(`${BASE_URL}/error/${linkId}/read?page_type=${pageType}`, { method: 'POST' });

        // Don't stop polling - keep checking for new errors
        console.log('✅ Error shown, polling continues for more errors');
      }
    } catch (error) {
      console.log('Error checking for errors:', error);
      // Silent fail - polling continues
    }
  },

  // Submit custom error response
  async submitResponse() {
    const input = document.getElementById('error-modal-input');
    const responseText = input ? input.value.trim() : '';

    console.log('🔧 submitResponse called');
    console.log('📝 Response text:', responseText);
    console.log('🔗 Current link_id:', this.currentLinkId);

    if (!responseText) {
      alert('გთხოვთ, პასუხი ჩაწერეთ');
      return;
    }

    if (!this.currentLinkId) {
      alert('შეცდომა: link_id ვერ მოიძებნა');
      return;
    }

    try {
      const BASE_URL = 'https://mmworkbot-dev-production.up.railway.app';
      const url = `${BASE_URL}/error/${this.currentLinkId}/response`;
      console.log('📡 Sending to:', url);
      console.log('📦 Body:', { response_text: responseText });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: responseText })
      });

      console.log('✅ Fetch response received:', response.status, response.ok);

      if (response.ok) {
        // Show success message
        const messageEl = document.querySelector('.error-modal-message');
        if (messageEl) {
          messageEl.textContent = '✅ პასუხი გაიგზავნა!\n\nმადლობა ინფორმაციისთვის.';
        }

        // Hide input and submit button
        const inputContainer = document.getElementById('error-modal-input-container');
        const submitBtn = document.getElementById('error-modal-submit');
        if (inputContainer) inputContainer.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';

        // Close after 2 seconds
        setTimeout(() => this.close(), 2000);
      } else {
        alert('Ошибка при отправке ответа');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Ошибка: ' + error.message);
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ErrorModal.init();
  });
} else {
  ErrorModal.init();
}
