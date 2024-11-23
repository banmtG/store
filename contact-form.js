class ContactForm extends HTMLElement {
    constructor() {

      super();
      this.attachShadow({ mode: 'open' });

      //variables used to store properties of Components
      this.total = 0;

      this.componentCSS = `<link rel="stylesheet" href="./contact-form.css" />`;
      this.CSSJSlibraries =``;
      this.MinTime=this.toLocalISOTime(0); 
      this.DeliverTime=this.toLocalISOTime(1);
      this.MaxTime=this.toLocalISOTime(10);
     // console.log(this.MinTime);
     // console.log(this.DeliverTime);
      //console.log(this.MaxTime);
      this.contactData = {
        name: "",
        tel: "",
        email: "",
        time:this.DeliverTime,
        address:"",
      };      
    }
    
    connectedCallback() {
      this.render(); // setup all HTML and CSS skeleton of the Component
      this._initializeComponent();
    }    

// SETUP OPTIONS FOR THE COMPONENT AND SAVE TO COMPONENT PROPERTIES IN CONSTRUCTOR AREA ////////////////
    static get observedAttributes() {
      return ['style','data']; 
    }

    async _initializeComponent() {
      try {
        // Example: Wait for DOM readiness and data fetch
        await Promise.all([this._waitForDomReady()]);
        this.setAttribute("ready", ""); 
      } catch (error) {
        console.error("Component initialization failed:", error);
      }
    }

    _waitForDomReady() {
      return new Promise((resolve) => {
        if (this.shadowRoot) {
          const observer = new MutationObserver((mutations, observer) => {
            const content = this.shadowRoot.querySelector(".container");
            if (content) {
              observer.disconnect();
              resolve();
            }
          });
  
          observer.observe(this.shadowRoot, { childList: true, subtree: true });
        } else {
          resolve();
        }
      });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'style') this.changeCssStyle(newValue);   
        if (name === 'contact_data') {
          this.contactData = newValue;     
        //  console.log(this.contactData);     
          this.updateForm();  
        }        
    }

    changeCssStyle(style) {
      if (style === 'shopee') { 
        console.log('style = shopee');
      }
    }

// write BOTH GETTER AND SETTER methods to interact with outside world //////////////////////////
    set contact_data(data) {
      this._oData = data; // underscore for private denotes
      this.contactData = data; // setup initial filter data the same as whole set.
      //just render parts of the component that is data-dependent
      this.render();   
      console.log(this.contactData);   
      //this.checkAllInput();
    }

    get contact_data() {
      return this._oData || [];
    }

    set setContactData(data) {
        this.contactData = data;
        this.updateForm();  
    }
  
    get getContactData() {
        return this.contactData || [];
    }

// FUNCTION METHODS OF THE COMPONENT /////////////////////////////////////////////////////////
    render() {
      // MAIN HTML SKELETON OF THE COMPONENT
      this.shadowRoot.innerHTML = `${this.componentCSS}${this.CSSJSlibraries}
        <div class="container" tabindex="0" role="dialog" aria-modal="true">
          <div class="header">
           <span class="contact_form_title">Thông tin đơn hàng</span>
          </div>
          <div class="contact_info">
      
            <input name="i_name" label="Tên đầy đủ" placeholder="Tên đầy đủ" size="small" value="${this.contactData.name || ""}">
            <input label="Số điện thoại" placeholder="Số điện thoại" type="tel" size="small" value="${this.contactData.tel || ""}" >        
            <input label="Email" placeholder="Email" name="Email" size="small" value="${this.contactData.email || ""}" >
            <input label="Địa chỉ giao hàng" placeholder="Địa chỉ nhận hàng" size="small" value="${this.contactData.address || ""}">
            <div class="input_extra">
              <span class="input_name">Ngày dự kiến giao hàng</span>            
              <input label="Ngày dự kiến giao hàng" size="small"                  
                  type="datetime-local"
                  id="deliver_time"
                  name="deliver_time"
                  style="width:98%"
                  value="${this.contactData.time}"
                  min="${this.MinTime}" max="${this.MaxTime}"                  
              <span class="input_helpertext">Giao sớm nhất là 24h và trễ nhât là 10 ngày tính từ thời điểm đặt hàng</span>
            </div>
          </div>
          <div class="footer">
            <button class='sendRequest'><span>Gửi yêu cầu</span>
              <sl-icon slot="suffix" name="backspace-reverse"></sl-icon>
            </button>
            <button class='backBtn'>
                 <sl-icon slot="prefix" name="backspace"></sl-icon><span>Quay về</span>
            </button>
          </div>
        </div>
        `;

        this.focusFirstElement();
        this.shadowRoot.addEventListener("keydown", this.trapFocus.bind(this));

        const backBtn=this.shadowRoot.querySelector('.backBtn');

        backBtn.addEventListener('click', () => {
          this.fireRemoveEvent();
        });


      // DECLARE DIVs inside the component skeleton for later use
      const container=this.shadowRoot.querySelector('.container');
      const header=this.shadowRoot.querySelector('.header');
      const contact_info=this.shadowRoot.querySelector('.contact_info');
      const footer=this.shadowRoot.querySelector('.footer');

      const name = this.shadowRoot.querySelector('input[label="Tên đầy đủ"]');
      const tel = this.shadowRoot.querySelector('input[label="Số điện thoại"]');
      const email = this.shadowRoot.querySelector('input[label="Email"]');
      const deliver_time = this.shadowRoot.querySelector('#deliver_time');
      const address = this.shadowRoot.querySelector('input[label="Địa chỉ giao hàng"]');
            

      //console.log(deliver_time.shadowRoot.querySelector('label'));

      deliver_time.classList.add('italictext');

    //    .addEventListener('click', () => (tooltip.open = !tooltip.open));
  

      name.addEventListener('blur', ()=> {
        this.contactData.name = name.value;
        //console.log(this.contactData);
        this.checkNameInput();  
        this.fireChangeEvent();
      })

      tel.addEventListener('blur', ()=> {
        this.checkTelInput();     
        this.fireChangeEvent();     
      })

      email.addEventListener('blur', ()=> {
        this.checkEmailInput();
        this.fireChangeEvent();
      })

      address.addEventListener('blur', ()=> {
        this.contactData.address = address.value;
        //console.log(this.contactData);
        this.checkAddressInput();  
        this.fireChangeEvent();
      })     


      const sendRequest=this.shadowRoot.querySelector('.sendRequest');
      sendRequest.addEventListener('click', () => {
          if (this.checkAllInput()) this.fireProceedEvent();
        //console.log(this.validateEmail(email.value));
        // tooltip.open = !tooltip.open;
        //console.log(this.isVietnamesePhoneNumber(this.removeAlltSpaces(phone.value)));    
            
      })

      
      deliver_time.addEventListener('blur',(e)=> {        
        this.validateMinMax(deliver_time.value);
        // console.log(deliver_time.value);
        // console.log(new Date(deliver_time.value).getTime());
        this.fireChangeEvent();
      });
      
      deliver_time.addEventListener('keyup',(e)=> {
        if (e.key === 'Enter' || e.keyCode === 13) {
       this.validateMinMax(deliver_time.value);   
       this.fireChangeEvent(); 
        }        
      }); 
 
    }

    //METHODS TO UPDATE INTERFACE PARTS (EACH METHOD FOR EACH PART)
    populateCategoryDropdown() {

    }
      
    focusFirstElement() {
      const focusableElements = this.getFocusableElements();

      if (focusableElements.length > 0) {
        console.log(focusableElements[0]);
        focusableElements[0].focus();      
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
        this.fireRemoveEvent();
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

    // fireChangeEvent() {
    //   const event = new CustomEvent('contact_form_Changed', {
    //       detail: { selectedItems: this.selectedItems,
    //           total: this.calculateAndUpdateTotal(),
    //        }
    //       });
    //   this.dispatchEvent(event);
    // }

    fireRemoveEvent() {
      console.log(`fireRemoveEvent`);
      const event = new CustomEvent('removeContactForm', {
          detail: { contact: this.contactData
           },
           bubbles:true,
           composed:true,           
          });
      this.dispatchEvent(event);
    }

    fireProceedEvent() {
      console.log(`proceedContactForm`);
      const event = new CustomEvent('proceedContactForm', {
          detail: { contactData: {
                                  name: this.contactData.name,
                                  tel: this.removeAlltSpaces(this.contactData.tel),
                                  email: this.contactData.email,
                                  time: this.DeliverTime,
                                  address: this.contactData.address,
                                } 
          },
           bubbles:true,
           composed:true,           
          });
      this.dispatchEvent(event);
    }

    
    checkAllInput() {
      console.log(`checkAllInput`);
      if (!this.checkNameInput(false)) return false;
      if (!this.checkTelInput(false)) return false;
      console.log(`checkTelInput true`);
      if (!this.checkEmailInput(false)) return false;
      console.log(`checkEmailInput true`);

      const deliver_time = this.shadowRoot.querySelector('#deliver_time'); 

      if (!this.validateMinMax(deliver_time.value)) return false;
      console.log(`validateMinMax true`);
      if (!this.checkAddressInput(false)) return false;
      return true;
    }

    checkNameInput(allowEmpty=true) {      
      const name = this.shadowRoot.querySelector('input[label="Tên đầy đủ"]');          
           this.contactData.name = name.value;
      if (allowEmpty===false&&this.contactData.name==="") {
        this.notify("Name cannot be blank!", "warning", "exclamation-triangle" );
        name.classList.add('glowing');      
        return false;
      } else {
        name.classList.remove('glowing');      
        return true;    
      }   
    }

    checkAddressInput(allowEmpty=true) {      
      const address = this.shadowRoot.querySelector('input[label="Địa chỉ giao hàng"]');  
      this.contactData.address = address.value;
      if (allowEmpty===false&&this.contactData.address==="") {
        this.notify("Address cannot be blank!", "warning", "exclamation-triangle" );
        address.classList.add('glowing');      
        return false;
      } else {
        address.classList.remove('glowing');      
        return true;    
      }
   
    }

    checkEmailInput(allowEmpty=true) {        
        const email = this.shadowRoot.querySelector('input[label="Email"]');
        this.contactData.email = email.value;
        if (allowEmpty===false&&this.contactData.email==="") {
          this.notify("Email cannot be blank!", "warning", "exclamation-triangle" );
            email.classList.add('glowing');      
          return false;
        }
        //console.log(this.contactData);
        if (!this.validateEmail(email.value) && email.value!="") {
            this.notify("Incorrect email format!", "warning", "exclamation-triangle" );
            email.classList.add('glowing');      
            return false;      
        } else {
            email.classList.remove('glowing');
            return true;
           // this.fireChangeEvent();
        }  
     
    }

    checkTelInput(allowEmpty=true) {        
      //console.log(`checked phone`);
        const tel = this.shadowRoot.querySelector('input[label="Số điện thoại"]');
        this.contactData.tel = tel.value;
        if (allowEmpty===false&&this.contactData.tel==="") {
          this.notify("Tel cannot be blank!", "warning", "exclamation-triangle" );
          tel.classList.add('glowing');      
          return false;
        }
        if (!this.isVietnamesePhoneNumber(tel.value) && tel.value!="") {
            this.notify("Incorrect phone format!", "warning", "exclamation-triangle" );
            tel.classList.add('glowing');
            return false;
        } else {
            tel.classList.remove('glowing');
            return true;
        }  
    }

    validateEmail(email) {
        // More sophisticated regular expression based on RFC 5322 official standard
        const emailRegex = /^(?=.{1,64}@.{4,255}$)(?!.*\.\.)(?!(^|[^\\])@.*\.\.)([a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+)@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})$/;
      
        return emailRegex.test(email);
      }

    isVietnamesePhoneNumber(input_number) {
        const number = this.validateAndCleanPhoneNumber(input_number);
        if (number === null) return false;
        const tel = this.shadowRoot.querySelector('input[label="Số điện thoại"]');

        tel.value = number;
        const noSpaceNumber = this.removeAlltSpaces(number);

        return /(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}(?:[^\d]+|$)/g.test(noSpaceNumber);         
    }

    replaceSpacewithEmdash(str) {
        return str.replace(/\s/g, '_');
    }


    removeAlltSpaces(str) {
        return str.trim().replace(/\s+/g, '');
    }

    toLocalISOString(date) {
        const localDate = new Date(date - date.getTimezoneOffset() * 60000); //offset in milliseconds. Credit https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
      
        // Optionally remove second/millisecond if needed
        localDate.setSeconds(null);
        localDate.setMilliseconds(null);
        return localDate.toISOString().slice(0, -1);
    }

    toLocalISOTime(numberOfDays) {
        let date=new Date();
        date.setDate(date.getDate() + numberOfDays);  
        //console.log(date);

        let theDay = date.getDate();      
        let theMonth = date.getUTCMonth()+1;        
        let theYear = date.getFullYear();
        let theHour =  date.getHours();
        let theMinute =  date.getMinutes();

        if (theMonth.toString().length==1) theMonth=`0${theMonth}`;
        if (theDay.toString().length==1) theDay=`0${theDay}`;
        if (theHour.toString().length==1) theHour=`0${theHour}`;
        if (theMinute.toString().length==1) theMinute=`0${theMinute}`;

        return `${theYear}-${theMonth}-${theDay}T${theHour}:${theMinute}`;
    }

    validateMinMax(value) {
      console.log(`vao validateMinMax`);
        const deliver_time = this.shadowRoot.querySelector('#deliver_time');
        console.log(deliver_time.value);

        const newMinTime =  this.toLocalISOTime(2);
        const number = new Date(value).getTime();
        const Min = new Date(newMinTime).getTime();
        const Max = new Date(this.MaxTime).getTime();
               
    
        if (value===undefined) {
          this.notify("Nhập lại thời gian giao hàng mong muốn!", "warning", "exclamation-triangle" );
          deliver_time.classList.add('glowing');
          return false;
        }

        console.log(number);
        if (number<Min || value=="") {        
            deliver_time.classList.add('glowing'); 
            console.log(deliver_time.classList);
           

            this.notify("Yêu cầu giao hàng quá sớm!", "warning", "exclamation-triangle" );
            setTimeout(()=>{deliver_time.value =  this.toLocalISOTime(3);
              deliver_time.classList.add('glowing_green'); 
            },2000)
            setTimeout(() => {
              deliver_time.classList.remove('glowing');
              deliver_time.classList.remove('glowing_green'); 
            }, 3000);

            return false;
        } else if (number>Max) {
            this.notify("Yêu cầu giao hàng quá xa trong tương lai!", "warning", "exclamation-triangle" );

            deliver_time.classList.add('glowing');
            setTimeout(()=>{
              deliver_time.value = this.toLocalISOTime(10);          
              deliver_time.classList.add('glowing_green'); 
            },2000)
            setTimeout(() => {
              deliver_time.classList.remove('glowing');
              deliver_time.classList.remove('glowing_green'); 
            }, 3000); 
            console.log(deliver_time.classList);
            return false;
        } else {
          deliver_time.classList.remove('glowing');
          this.DeliverTime = value;
          return true;
        }

    }
   
    //container = document.querySelector('.alert-toast-wrapper');
  
    // Always escape HTML for text arguments!
    escapeHtml(html) {
      const div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    }
  
    // Custom function to emit toast notifications

    notify(message, variant = 'primary', icon = 'info-circle', duration = 2000) {
      const alert = Object.assign(document.createElement('sl-alert'), {
        variant,
        closable: true,
        duration: duration,
        countdown: "rtl",
        innerHTML: `
                                
          ${this.escapeHtml(message)}
        `
      });
      console.log(`vao notify`);
      this.shadowRoot.append(alert);
      return alert.toast();
    }

    fireChangeEvent() {
      console.log(this.DeliverTime);
        const event = new CustomEvent('contact_form_Changed', {
            detail: { contactData: {name: this.contactData.name,
                                    tel: this.removeAlltSpaces(this.contactData.tel),
                                    email: this.contactData.email,
                                    time: this.DeliverTime,
                                    address: this.contactData.address,
                                    } 
                    },
            bubbles:true,
            composed:true,
                  
        });
        this.dispatchEvent(event);
      }

    validateAndCleanPhoneNumber(input) {
        if (typeof input !== "string") {
            console.error("Input must be a string.");
            return null;
        }
    
        // Remove spaces and non-numeric characters except '+' at the start
        let cleanedInput = input.replace(/\s+/g, "").replace(/[^\d+]/g, "");
    
        // If the cleaned input starts with "+84"
        if (cleanedInput.startsWith("+84")) {
            cleanedInput = cleanedInput.replace("+84", "84"); // Remove the '+' for validation
            if (cleanedInput.length === 11) {
                return "+84" + cleanedInput.slice(2); // Restore '+84'
            }
        }
    
        // If the cleaned input starts with "0"
        if (cleanedInput.startsWith("0")) {
            if (cleanedInput.length === 10) {
                return cleanedInput; // Valid phone number
            }
        }
    
        // Invalid phone number
        return null;
    }

  }

  customElements.define('contact-form', ContactForm);
