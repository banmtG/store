class CustomOverlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.componentCSS = `<link rel="stylesheet" href="./card-viewer.css" />`;   
   
    }
    
    connectedCallback() {
        this.render();
    }

    render() {    
        this.shadowRoot.innerHTML = `${this.componentCSS}
        <div class="overlay">
            <div tabindex="0" id="container" role="dialog" aria-modal="true">

            <input readonly><input readonly><input><input><input><input>
            <button id="close-overlay">Close</button>
            </div>
        </div>
      `;
  
      // Close button logic
      this.shadowRoot.querySelector("#close-overlay").addEventListener("click", () => this.hideOverlay());
  
      // Trap focus logic
      this._trapFocus();
  
      // Handle keyboard interactions (e.g., Escape key)
      this._handleKeyInteractions();

      // Handle Android bug
      this._disableAllInputInsteadOfTheFocus();

      // handle overlay click
      this._handleOverlayClick();
    }
  
    showOverlay() {
      this.hidden = false;
      //document.querySelector("#main-content").classList.add("dimmed");
      this._previouslyFocusedElement = document.activeElement;
      console.log(this._previouslyFocusedElement);
      this.shadowRoot.querySelector("#container").focus();
      this._focusElement(1);
    }

    _handleOverlayClick () {
        const overlay = this.shadowRoot.querySelector('.overlay');
        overlay.addEventListener('click',(e)=>{         
            e.stopPropagation();
            this.hideOverlay();
        })
    }
  
    hideOverlay() {
      this.hidden = true;
      //document.querySelector("#main-content").classList.remove("dimmed");
      if (this._previouslyFocusedElement) this._previouslyFocusedElement.focus();
    }

    _focusElement(n) {
        const focusableElements = this._getFocusableElements();  
        if (focusableElements.length > 0) {
          focusableElements[n-1].focus();      
        }
    }
  
    _getFocusableElements() {
        return Array.from(
          this.shadowRoot.querySelectorAll("button, input, textarea, select, a[href]")
        ).filter((el) => !el.hasAttribute("disabled"));
    }
    
    _disableAllInputInsteadOfTheFocus() {
        const allInputs = Array.from(this.shadowRoot.querySelectorAll("input"));
        allInputs.forEach((inPut,index)=>{
            inPut.addEventListener("focus",()=>{
                const filteredInput = allInputs.filter(obj => obj != inPut);
                filteredInput.forEach((otherInput)=>{
                    otherInput.readOnly = true;
                    setTimeout(()=> {
                        this.shadowRoot.querySelectorAll("input")[4].value = "hallo in";
                    },5000);
                })
                inPut.readOnly = false;                 
            }); 
        })

    }


    _trapFocus() {    
        const focusableElements = this._getFocusableElements();  
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        this.shadowRoot.addEventListener("keydown", (event) => {
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
        });
      }

  
    _handleKeyInteractions() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !this.hidden) {           
            this.hideOverlay();
        }
      });
    }

    _handleEventCreation(data,eventName) {
        const event = new CustomEvent(eventName, {
            detail: { data
            },
            bubbles: true, // Allow bubbling to the document 
            composed: true // Allow crossing Shadow DOM boundaries 
            });
        this.dispatchEvent(event);     
    }
  }
  
  customElements.define("custom-overlay", CustomOverlay);
  
 