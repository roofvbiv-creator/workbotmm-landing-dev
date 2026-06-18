// Success Modal - Modal for displaying success message
// Usage: Call SuccessModal.startPolling() to check for success
// VERSION: 1.0 - 2026-06-18

const SuccessModal = {
  // Initialize modal
  init() {
    const modal = document.getElementById('success-modal');
    if (!modal) {
      this.createModal();
    }
    this.attachEventListeners();
  },

  // Create modal HTML structure
  createModal() {
    const modalHTML = `
      <div id="success-modal" class="success-modal">
        <div class="success-modal-content">
          <div class="success-modal-icon">✅</div>
          <div class="success-modal-title">ყურადღება</div>
          <div class="success-modal-message">ჩვენ მივიღეთ თქვენი მოთხოვნა დასამუშავებლად, თანხა ჩაირიცხება 24 საათის განმავლობაში. გმადლობთ ჩვენი სერვისის გამოყენებისთვის!</div>
          <div class="success-modal-buttons">
            <button class="success-modal-btn success-modal-btn-close" onclick="SuccessModal.close()">
              დახურვა
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  // Attach event listeners
  attachEventListeners() {
    const modal = document.getElementById('success-modal');
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

  // Show modal
  show() {
    const modal = document.getElementById('success-modal');
    if (!modal) {
      this.init();
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Auto-close after 3 seconds
    setTimeout(() => this.close(), 3000);
  },

  // Close modal
  close() {
    const modal = document.getElementById('success-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  // Polling function to check for success from backend
  startPolling(linkId, pageType = 'orders', intervalMs = 3000) {
    if (!linkId) {
      console.warn('SuccessModal.startPolling: linkId is required');
      return;
    }

    // Initial setup
    this.init();
    this.pollingInterval = setInterval(() => {
      this.checkForSuccess(linkId, pageType);
    }, intervalMs);

    console.log(`✅ Success polling started for link_id=${linkId}, page_type=${pageType}`);
  },

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('❌ Success polling stopped');
    }
  },

  // Check for success from backend
  async checkForSuccess(linkId, pageType = 'orders') {
    try {
      const BASE_URL = 'https://mmworkbot-dev-production.up.railway.app';
      const response = await fetch(`${BASE_URL}/success/${linkId}?page_type=${pageType}`);
      if (!response.ok) return;

      const data = await response.json();
      if (data && data.success) {
        // Success found - show modal
        this.show();

        // Mark as read (prevent looping)
        await fetch(`${BASE_URL}/success/${linkId}/read?page_type=${pageType}`, { method: 'POST' });

        console.log('✅ Success modal shown, marked as read');
      }
    } catch (error) {
      console.log('Error checking for success:', error);
      // Silent fail - polling continues
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SuccessModal.init();
  });
} else {
  SuccessModal.init();
}
