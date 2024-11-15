class DialogComponent extends HTMLElement {
  constructor() {

    super();
    this.attachShadow({ mode: 'open' });

    this.label = "";
    this.message = "";
    this.OK = "";
    this.cancel = "";
    this.closeOnOverlay = false;
    //variables used to store properties of Components
    this.CSSMain = `<style>
    .container {
      z-index:100;
      display:flex;
      justify-content:center;
      align-items:center;
      position: fixed;
      inset: 0px;
      background-color: rgba(0,0,0,0.5);
    }

      .dialog {
          width: 300px;
          border: 1px solid #ccc;                  
          background-color: white;
      }

      .header {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 5px 5px 5px 10px;
          border-bottom: 1px solid #ccc;
          font-size: 1.2rem;
          font-weight: bold;
          background: var(--theme-color);
      }

      .center {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 5px;
          padding: 10px 10px 20px 5px;
          border-bottom: 1px solid #ccc;
          font-size: 1.2rem;  
      }

      .center > *:first-child {
          flex: 1;
          flex-grow: 1
      }

      .center > span {
          flex: 7;
      }
       

      .footer {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 10px;
          font-size: 1.2rem;
      }

      button {
        border-radius: 5px;
        display:flex;
        justify-content: center;
        align-items: center;
        background: var(--theme-color); 
        color: rgba(0,0,75,0.7);
        border: none;
        padding: 5px 10px;
        font-size:1.1rem;        
      }

      .buttonfocused {
        outline: 2px solid blue;
      }

    .hidden {      
      display: none;
    }
      </style>`;

  }
  
  connectedCallback() {
   
    this.render(); // setup all HTML and CSS skeleton of the Component
    this.overlay.style.display = "none";
  }

  disconnectedCallback() {
    //this.removeEventListeners();
  }


// SETUP OPTIONS FOR THE COMPONENT AND SAVE TO COMPONENT PROPERTIES IN CONSTRUCTOR AREA ////////////////
  static get observedAttributes() {
    return [`style`,`label`,`message`,`okbtn`,`cancelbtn`,`destroyonclose`,`state`]; 
  }

  attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'style')  this.changeCssStyle(newValue);
      if (name === 'label') this.label = newValue;
      if (name === 'message') this.message = newValue;
      if (name === 'okbtn') this.OK = newValue;
      if (name === 'cancelbtn') this.cancel = newValue;
      if (name === 'destroyonclose') this.destroyonclose = newValue;
      if (name === 'state') this.state = "cancel";
      this.render();
  }

  changeCssStyle(style) {
    
  }

// write BOTH GETTER AND SETTER methods to interact with outside world //////////////////////////
  set value(value) {
    this.render();
  }

  get value() {
    return this._value || undefined;
  }

// FUNCTION METHODS OF THE COMPONENT /////////////////////////////////////////////////////////
  render() {
    // MAIN HTML SKELETON OF THE COMPONENT
    this.shadowRoot.innerHTML = `${this.CSSMain}
  <div class='container'>  
      <div class='dialog'>
          <div class="header">
              <div class="header_Label">${this.label}</div>
              <button class="closeBtn"><sl-icon name="x-lg"></sl-icon></button>    
          </div>     
          <div class="center">        
              ${this.message}     
          </div> 
          <div class="footer">
              <button name="confirmBtn" size="medium" variant="primary">${this.OK}</button>
              <button name="cancelBtn" size="medium" variant="primary">${this.cancel}</button>
          </div>
      </div>
  </div>  
      `;

      this.dialog = this.shadowRoot.querySelector('.dialog');
      this.overlay = this.shadowRoot.querySelector('.container');
      this.header_Label = this.dialog.querySelector('.header_Label');
      this.center = this.dialog.querySelector('.center');
      this.confirmBtn = this.dialog.querySelector('button[name="confirmBtn"]');
      this.cancelBtn = this.dialog.querySelector('button[name="cancelBtn"]');
      this.closeBtn = this.dialog.querySelector('.closeBtn');
      
      this.focusFirstElement();
      this.shadowRoot.addEventListener("keydown", this.trapFocus.bind(this));

      this.addEventListeners();  

    // DECLARE DIVs inside the component skeleton for later use   
  }          

  _onOverlayClick(e) {
    if (e.target === this.overlay && this.closeOnOverlay) {
      this._resolveDialog(false);
    }
  }

  addEventListeners() {
    this.confirmBtn.addEventListener('click',(e) => this._resolveDialog(true));
    this.cancelBtn.addEventListener('click',(e) => this._resolveDialog(false));
    this.closeBtn.addEventListener('click',(e) => this._resolveDialog(false));
    this.overlay.addEventListener('click',(e) => this._onOverlayClick(e));
   

  }

  removeEventListeners() {
    this.confirmBtn.removeEventListener('click',(e) => this._resolveDialog(true));
    this.cancelBtn.removeEventListener('click',(e) => this._resolveDialog(false));
    this.closeBtn.removeEventListener('click',(e) => this._resolveDialog(false));
    this.overlay.removeEventListener('click',(e) => this._onOverlayClick(e));
  }

  focusFirstElement() {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[1].focus();
      focusableElements[1].classList.add('buttonfocused');
    }
  }

  getFocusableElements() {
    return Array.from(
      this.shadowRoot.querySelectorAll("button, input, textarea, select, a[href]")
    ).filter((el) => !el.hasAttribute("disabled"));
  }

  trapFocus(event) {
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];


    if (event.key === "Escape") {
      this._resolveDialog(false);
    }

    if (event.key === "Tab") {
      for (const item of focusableElements) {
        item.classList.remove('buttonfocused');
      }

      if (event.shiftKey) {
        // Shift + Tab navigation
        if (this.shadowRoot.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Regular Tab navigation
        if (this.shadowRoot.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  show({label = "Confirmation", message = "Are you sure?",okbtn = "OK",cancelbtn="Cancel", closeOnOverlay = false} = {}) {
    
    this.label = label;
    this.message = message;
    this.OK = okbtn;
    this.cancel= cancelbtn;
    this.render();
    this.closeOnOverlay = closeOnOverlay;
    this.overlay.style.display = "flex";
    this.overlay.focus();

  
   // console.log(this.confirmBtn); 
    return new Promise((resovleFunction) => {

      this.focusFirstElement();

      this._resolveDialog = (value) => {
        this.overlay.style.display = "none";  
        this.ResolveEvent(value);
       // console.log(value);
        resovleFunction(value);     
      }
    })

  }

  ResolveEvent(value) {
    const event = new CustomEvent('resovleEvent', {
        detail: { result: value }
        });
    this.dispatchEvent(event);
  }
  
}

customElements.define('dialog-component', DialogComponent);


