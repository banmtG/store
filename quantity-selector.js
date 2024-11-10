class QuantitySelector extends HTMLElement {
    constructor() {

      super();
      this.attachShadow({ mode: 'open' });


      //variables used to store properties of Components
    
      this.minValue = 0;
      this.maxValue = 10000;
      this.oldValue;
      
      this.CSSMain = `<style>
        .container {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 86px;w
          height: auto;
        }

        .buttonQ {
          display:flex;
          justify-content: center;
          align-items: center;
          width:25px;
          height: 21px;
          font-size:16px;
          border: 1px solid #D4D4D8;
        }

        input {
          text-align: center; 
          width: 30px;
          height: 19px;
          border: 1px solid #D4D4D8;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

      </style>`
      this.CSSJSlibraries =` <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/light.css" />
      <script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/shoelace-autoloader.js"></script>`;
    }
    
    connectedCallback() {
      this.render(); // setup all HTML and CSS skeleton of the Component
    }

// SETUP OPTIONS FOR THE COMPONENT AND SAVE TO COMPONENT PROPERTIES IN CONSTRUCTOR AREA ////////////////
    static get observedAttributes() {
      return ['style',`min`,`max`,`value`]; 
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'style') this.changeCssStyle(newValue);
        if (name === 'min') this.minValue = parseInt(newValue);
        if (name === 'max') this.maxValue = parseInt(newValue);
        if (name === 'value') {
          this.number = parseInt(newValue);
          this.render();
        }
    }

    changeCssStyle(style) {
      
    }

// write BOTH GETTER AND SETTER methods to interact with outside world //////////////////////////
    set value(value) {
      this._value = value; // underscore for private denotes, this will not change in the lifecycle of the component
      this.number = value;
      this.render();
    }

    get value() {
      return this._value || undefined;
    }

// FUNCTION METHODS OF THE COMPONENT /////////////////////////////////////////////////////////
    render() {
      // MAIN HTML SKELETON OF THE COMPONENT
      this.shadowRoot.innerHTML = `${this.CSSMain}${this.CSSJSlibraries}
        <div class="container">           
            <button class="buttonQ decrease-btn"><sl-icon size="large" name="dash-lg"></sl-icon></button>
            <input type="number" value="${this.number || 0}"></input>
            <button class="buttonQ increase-btn"><sl-icon size="large" name="plus-lg"></sl-icon></button>
        </div>
        `;

      // DECLARE DIVs inside the component skeleton for later use
      const container=this.shadowRoot.querySelector('.container');
      const decreaseBtn=this.shadowRoot.querySelector('.decrease-btn');
      const quantityInput = this.shadowRoot.querySelector('input[type="number"]');
      const increaseBtn=this.shadowRoot.querySelector('.increase-btn');

      decreaseBtn.addEventListener('click',(e) => {
        if (quantityInput.value > this.minValue) {
          quantityInput.value = parseInt(quantityInput.value) - 1;
          this.updateValue(quantityInput.value);
          this.render();
          this.fireChangeEvent();
        }
 
      });

      increaseBtn.addEventListener('click',(e) => {
        if (quantityInput.value < this.maxValue) {
          quantityInput.value= parseInt(quantityInput.value) + 1;
          this.updateValue(quantityInput.value);
          this.render();
          this.fireChangeEvent(); 
        }
      });

      quantityInput.addEventListener('blur',(e)=> {
        this.checkandChangeValue(quantityInput.value);
      });
      
      quantityInput.addEventListener('keyup',(e)=> {
        if (e.key === 'Enter' || e.keyCode === 13) {
          this.checkandChangeValue(quantityInput.value);
        }        
      }); 

     
    }      

    checkandChangeValue(valuequantityInput) {
      this.oldValue = this.number;
      const value = parseInt(valuequantityInput);
      console.log(value);
      if (value>=0) this.updateValue(value); else {
        if (valuequantityInput!=="") {             
          this.updateValue(this.oldValue);
          this.oldValue = this.number;
        } else this.updateValue(0);
        this.render();
      }
      this.fireChangeEvent();    
    }

    

    updateValue(value) {
      this.number = value;        
    }

    fireChangeEvent() {
        const event = new CustomEvent('valueChanged', {
            detail: { value: this.number || 0}
            });
        this.dispatchEvent(event);
    }
  }

  customElements.define('quantity-selector', QuantitySelector);
