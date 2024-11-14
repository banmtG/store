class ConfirmationDialog extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      // Create component template
      this.shadowRoot.innerHTML = `
        <style>
          /* Overlay styles */
          .overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          /* Dialog container */
          .dialog {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            text-align: center;
          }
          /* Header, message, and button styles */
          .header {
            font-size: 1.25em;
            margin-bottom: 10px;
          }
          .message {
            margin-bottom: 20px;
          }
          .buttons {
            display: flex;
            justify-content: space-around;
          }
          button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .confirm-btn { background-color: #28a745; color: white; }
          .cancel-btn { background-color: #dc3545; color: white; }
        </style>
        <!-- Dialog Structure -->
        <div class="overlay" id="overlay">
          <div class="dialog">
            <div class="header" id="header">Header</div>
            <div class="message" id="message">Message</div>
            <div class="buttons">
              <button class="cancel-btn" id="cancelButton">Cancel</button>
              <button class="confirm-btn" id="confirmButton">Confirm</button>
            </div>
          </div>
        </div>
      `;
  
      // Bind elements and methods
      this.overlay = this.shadowRoot.getElementById('overlay');
      this.headerElement = this.shadowRoot.getElementById('header');
      this.messageElement = this.shadowRoot.getElementById('message');
      this.confirmButton = this.shadowRoot.getElementById('confirmButton');
      this.cancelButton = this.shadowRoot.getElementById('cancelButton');
  
      // Default settings
      this.closeOnOverlayClick = true;
    }
  
    connectedCallback() {
      // Event listeners for buttons and overlay
      this.confirmButton.addEventListener('click', () => this.resolvetheDialog("OK"));
      this.cancelButton.addEventListener('click', () => this.resolvetheDialog("Not OK"));
      this.overlay.addEventListener('click', (e) => this.onOverlayClick(e));
    }
  
    disconnectedCallback() {
      // Clean up event listeners
      this.confirmButton.removeEventListener('click', () => this.resolvetheDialog("OK"));
      this.cancelButton.removeEventListener('click', () => this.resolvetheDialog("Not OK"));
      this.overlay.removeEventListener('click', (e) => this.onOverlayClick(e));
    }
  
    onOverlayClick(e) {
      if (e.target === this.overlay && this.closeOnOverlayClick) {
        this.resolvetheDialog("Not OK");
      }
    }
  
    // Show the dialog and return a promise
    showDialog({ header = 'Confirmation', message = 'Are you sure?', confirmText = 'Confirm', cancelText = 'Cancel', closeOnOverlayClick = true } = {}) {
      // Set content and settings
      this.headerElement.textContent = header;
      this.messageElement.textContent = message;
      this.confirmButton.textContent = confirmText;
      this.cancelButton.textContent = cancelText;
      this.closeOnOverlayClick = closeOnOverlayClick;
      this.overlay.style.display = 'flex';
  
      // Return a promise that resolves based on user interaction
      return new Promise((resolve) => {
        this.resolvetheDialog = (result) => {
          this.overlay.style.display = 'none';
          resolve(result);
        };
      });
    }
  }
  
  customElements.define('confirm-dialog', ConfirmationDialog);
  