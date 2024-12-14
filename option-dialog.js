class OptionDialog extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.componentCSS = `<link loading="lazy" rel="stylesheet" href="./option-dialog.css" />`;              
        this.CSSJSlibraries =`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/light.css" />    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/dark.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/dark.css" />
        <script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/shoelace-autoloader.js"></script>`;
       // this.CSSJSlibraries = "";
    }

    connectedCallback() {        
        this.render();
        
        this.shadowRoot.querySelector("#cancel").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("cancel"));
            this.close();
        });

        this.shadowRoot.querySelector("#confirm").addEventListener("click", () => {
            const values = this.getFormValues();
            this.dispatchEvent(new CustomEvent("confirm", { detail: values }));
            this.close();
        });
    }

    disconnectedCallback() {
       // this.shadowRoot.querySelector("#cancel").removeEventListener("click");
       // this.shadowRoot.querySelector("#confirm").removeEventListener("click");
    }

    render() {
        this.shadowRoot.innerHTML = `${this.CSSJSlibraries}${this.componentCSS}
        <div class="dialog">
            <div class="header">            
            </div>
            <div class="body noScrollBar"></div>
            <div class="footer">
                <button id="cancel">Cancel</button>
                <button id="confirm">Confirm</button>
            </div>
        </div>`;
        this._headerEl = this.shadowRoot.querySelector('.header');
        this._bodyEl = this.shadowRoot.querySelector('.body');
    }

    _scrollGuide() {
        const scrollableEles = Array.from(this.shadowRoot.querySelectorAll('.scrollableX,.scrollableY'));
       // console.log(scrollableEles);
        scrollableEles.forEach(parentEle=>{
            const arrow_container = document.createElement('div');
            arrow_container.classList.add('arrow_container');
            const arrowOne = document.createElement('div');
            arrowOne.innerHTML=`<span></span><span></span><span></span>`;
            arrowOne.classList.add('arrow');  
            const arrowTwo = document.createElement('div');
            arrowTwo.innerHTML=`<span></span><span></span><span></span>`;
            arrowTwo.classList.add('arrow');  
    
            if (parentEle.classList.contains("scrollableX")) {
                arrow_container.style.cssText="position:absolute; top: 62%; left:50%; display:flex; flex-direction:row;'";
                arrowOne.style.cssText="transform: rotate(90deg); top:-5px; left:-30px;";
                arrowTwo.style.cssText="transform: rotate(270deg); position:relative; top:-10px; left:30px;"  ;
               
            }
    
            if (parentEle.classList.contains("scrollableY")) {
                arrow_container.style.cssText="position:absolute; top: 50%; right:1.5rem; display:flex; flex-direction:column;'";
                arrowOne.style.cssText="transform: rotate(0deg); left:5px; top:30px";
                arrowTwo.style.cssText="transform: rotate(180deg); position:relative; top:-30px";        
            }
            arrow_container.appendChild(arrowOne);
            arrow_container.appendChild(arrowTwo);
            parentEle.appendChild(arrow_container);

            // hide/remove arrowGuides
            arrow_container.classList.add('arrow_container_faded');
            setTimeout(()=>{         
                // arrow_container.style.cssText = "opacity: 0;";   
                arrow_container.remove();
            },5000);
        });          
    }

    open(headerEl,bodyEl) {
        this._headerEl.innerHTML = headerEl;
        this._bodyEl.innerHTML = bodyEl;
        document.body.classList.add('disabled');
        this.classList.add("open");
        this._trapFocus();
        this._focusElement();
        this._scrollGuide();
    }
    
    close() {
        this.classList.remove("open");
        document.body.classList.remove('disabled'); 
    }
        /**
     * Retrieves values from all form elements in the body slot.
     */

    getFormValues() {

        const values = {};
        const formControls = this.shadowRoot.querySelectorAll("input, select, textarea");
        //console.log(formControls);
        // nodes.forEach((node) => {
        //     // 1. Process standard form controls
        //     const formControls = node.querySelectorAll("input, select, textarea");

            formControls.forEach((control) => {  
                if (control.name) {
                    if (control.tagName.toLowerCase()==="input")
                        switch (control.type) {
                        case "radio": 
                            if (control.checked) {
                                // console.log(control);
                                // Only add the checked radio
                                values[control.name] = control.value;
                            }
                            break;
                        case "checkbox":      
                            values[`${control.name}`] = control.checked; 
                            break;                      
                        case "file":
                            values[control.name] = control.value; 
                            if (control.multiple===true) {
                                let aArray = [];
                                for (let i = 0; i < control.files.length; i++)
                                    {
                                        aArray.push(control.files[i].name);
                                    }   
                                    values[control.name] = JSON.stringify(aArray);
                            } 
                            break;
                        default:            
                            console.log(control.type);
                            values[control.name] = control.value;
                        }
                
                    if (control.tagName.toLowerCase()==="select") {                    
                        values[control.name] = control.value;
                        if (control.multiple===true)
                        {
                            console.log(control.selectedOptions);
                            let aArray = [];
                            Array.from(control.selectedOptions).forEach(item=>{
                            // console.log(item.value);
                            aArray.push(item.value);
                            })
                            values[control.name] = JSON.stringify(aArray);
                        }             
                    }
                }
              
            });
    
            // 2. Process custom elements explicitly
            const customComponents = this.shadowRoot.querySelectorAll("*[data-custom-component]");
            customComponents.forEach((custom) => {
               // console.log(custom);
                const name = custom.getAttribute("name");

                if (typeof custom.getValue === "function") {
                    console.log(name);
                   // console.log(custom.getValue());
                    if (name) {                  
                        values[name] = custom.getValue();                                                   
                    } 
                } else if (custom.value) {
                    console.log(name);
                    //console.log(custom.value);
                    values[name] = custom.value;      
                } else if (custom.checked!==NaN) { 
                    console.log(name);
                    values[name] = custom.checked;      
                }
            });      

        return values;
    }

    setValues(obj) {
       
        for (let key in obj)
        {
         //   console.log(key);
          //  console.log(obj[key]);
          //  console.log(this.shadowRoot.querySelector(`*[name="${key}"]`));
            if (this.shadowRoot.querySelector(`input[type="range"][name="${key}"]`))
            this.shadowRoot.querySelector(`input[type="range"][name="${key}"]`).value = obj[key];
           if (this.shadowRoot.querySelector(`input[type="checkbox"][name="${key}"]`))
            this.shadowRoot.querySelector(`input[type="checkbox"][name="${key}"]`).checked = obj[key];
            if (this.shadowRoot.querySelector(`input[type="radio"][name="${key}"][value="${obj[key]}"]`))
            this.shadowRoot.querySelector(`input[type="radio"][name="${key}"][value="${obj[key]}"]`).checked = true;
            if (this.shadowRoot.querySelector(`select[name="${key}"]`))
            {
               // console.log(key);
                this.shadowRoot.querySelector(`select[name="${key}"]`).value = obj[key];
            }

            if (this.shadowRoot.querySelector(`[name="${key}"][data-custom-component]`))
                this.shadowRoot.querySelector(`[name="${key}"][data-custom-component]`).value = obj[key];

        }
    }
    
    _focusElement(n) {
     
        const focusableElements = this._getFocusableElements();  
      //  console.log(focusableElements);
        if (focusableElements.length > 0&&n<focusableElements.length) {
          focusableElements[n].focus();      
        } else focusableElements[0].focus();      
    }

    _getFocusableElements() {
        return Array.from(
          this.shadowRoot.querySelectorAll("button, input, textarea, select, a[href]")
        ).filter((el) => !el.hasAttribute("disabled"));
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
   
    
}

customElements.define("option-dialog", OptionDialog);
