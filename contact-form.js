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
    }    

// SETUP OPTIONS FOR THE COMPONENT AND SAVE TO COMPONENT PROPERTIES IN CONSTRUCTOR AREA ////////////////
    static get observedAttributes() {
      return ['style','data']; 
    }


    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'style') this.changeCssStyle(newValue);   
        if (name === 'contact_data') {
          this.contactData = newValue;          
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
      this.validateMinMax(this.contactData.time);
      this.checkEmailInput();
      this.checkTelInput();  
    
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
        <div class="container">
          <div class="header">
           <span class="contact_form_title">Thông tin đơn hàng</span>
          </div>
          <div class="contact_info">

            <sl-input label="Tên đầy đủ" type="text" size="small" value="${this.contactData.name || ""}"></sl-input>
            <sl-input label="Số điện thoại" type="tel" size="small" value="${this.contactData.tel || ""}" ></sl-input>            
            <sl-input label="Email" name="Email" type="email" size="small" value="${this.contactData.email || ""}" ></sl-input>
            <sl-input label="Ngày dự kiến giao hàng" size="small" 
                type="datetime-local"
                id="deliver_time"
                name="deliver_time"
                value="${this.contactData.time}"
                min="${this.MinTime}" max="${this.MaxTime}"
                help-text="Giao sớm nhất là 24h và trễ nhât là 10 ngày tính từ thời điểm đặt hàng">
                clearable
            </sl-input>
             
            <sl-input label="Địa chỉ giao hàng" size="small" value="${this.contactData.address || ""}"></sl-input>    
          </div>          
          <div class="footer">
            <sl-button class='back'>Quay về
                <sl-icon slot="prefix" name="box-arrow-left"></sl-icon>
            </sl-button>

            <sl-button class='sendRequest'>Gửi yêu cầu
              <sl-icon slot="suffix" name="box-arrow-right"></sl-icon>
            </sl-button>
          </div>
        </div>
        `;


        
   

      // DECLARE DIVs inside the component skeleton for later use
      const container=this.shadowRoot.querySelector('.container');
      const header=this.shadowRoot.querySelector('.header');
      const contact_info=this.shadowRoot.querySelector('.contact_info');
      const footer=this.shadowRoot.querySelector('.footer');

      const name = this.shadowRoot.querySelector('sl-input[label="Tên đầy đủ"]');
      const tel = this.shadowRoot.querySelector('sl-input[label="Số điện thoại"]');
      const email = this.shadowRoot.querySelector('sl-input[label="Email"]');
      const deliver_time = this.shadowRoot.querySelector('#deliver_time');
      const address = this.shadowRoot.querySelector('sl-input[label="Địa chỉ giao hàng"]');
            

      //console.log(deliver_time.shadowRoot.querySelector('label'));

      deliver_time.classList.add('italictext');

    //    .addEventListener('click', () => (tooltip.open = !tooltip.open));
  

      name.addEventListener('blur', ()=> {
        this.contactData.name = name.value;
        console.log(this.contactData);
        //this.fireChangeEvent();
      })

      tel.addEventListener('blur', ()=> {
        this.checkTelInput();          
      })

      email.addEventListener('blur', ()=> {
        this.checkEmailInput();
      })

      address.addEventListener('blur', ()=> {
        this.contactData.address = address.value;
        console.log(this.contactData);
      //  this.fireChangeEvent();
      })



      const sendRequest=this.shadowRoot.querySelector('.sendRequest');
      sendRequest.addEventListener('click', () => {
        console.log(this.validateEmail(email.value));
        tooltip.open = !tooltip.open;
        console.log(this.isVietnamesePhoneNumber(this.removeAlltSpaces(phone.value)));        
      })

      
      deliver_time.addEventListener('blur',(e)=> {        
        this.validateMinMax(deliver_time.value);
        // console.log(deliver_time.value);
        // console.log(new Date(deliver_time.value).getTime());
      });
      
      deliver_time.addEventListener('keyup',(e)=> {
        if (e.key === 'Enter' || e.keyCode === 13) {
       this.validateMinMax(deliver_time.value);    
        }        
      }); 

 

    //   const deliver_time = this.shadowRoot.querySelector('#deliver_time');
    //   console.log(this.toLocalISOTime(0));
    //   deliver_time.min=this.toLocalISOTime(0)
    //   deliver_time.value=this.toLocalISOTime(1);
    //   deliver_time.max=this.toLocalISOTime(30);
    //   const minDate = this.toLocalISOTime(0);
    // console.log(this.toLocalISOTime(1));
    // //   deliver_time.min=minDate;
    //    const date = new Date().getTime();
    //    console.log(date);

    //    const date1 = new Date(this.toLocalISOTime(1)).getTime();
    //    console.log(date1);
    //    console.log((date1-date)/60/60/1000/24);
    //    console.log(new Date(this.toLocalISOTime(1)).getTime());
    //    console.log(new Date().getTime());

    //   deliver_time.value=this.toLocalISOTime(1);
    //   deliver_time.max=this.toLocalISOTime(30);
    //     // console.log(date);
        // console.log(date.getDay());
        // console.log(date.getDate());
        // console.log(date.getMonth()+1);
        // console.log(date.getFullYear());
        // console.log(date.getHours());
        // console.log(date.getMinutes());
        // console.log(date.setDate(date.getDate() + 1));


      // ADD addEventListener FOR EACH div/button declared in this skeleton.

      // this.shadowRoot.querySelector('#search-input').addEventListener('sl-input', (e) => {
      //   this.searchTerm = e.target.value;
      //   this.updateGrid();
      // });

      // this.shadowRoot.querySelector('#category-select').addEventListener('sl-change', (e) => {
      //   this.selectedCategory = e.target.value;
      //   this.updateGrid();
      // });

      // CALL function(s) to change parts of the skeleton that are data-driven
    }

    //METHODS TO UPDATE INTERFACE PARTS (EACH METHOD FOR EACH PART)
    populateCategoryDropdown() {

    }
      
    fireChangeEvent() {
      const event = new CustomEvent('itemSelected', {
          detail: { selectedItems: this.selectedItems,
              total: this.calculateAndUpdateTotal(),
           }
          });
      this.dispatchEvent(event);
    }

    checkEmailInput() {        
        const email = this.shadowRoot.querySelector('sl-input[label="Email"]');
        this.contactData.email = email.value;
        //console.log(this.contactData);
        if (!this.validateEmail(email.value) && email.value!="") {
            this.notify("Incorrect email format!", "warning", "exclamation-triangle" );
            email.classList.add('glowing');            
        } else {
            email.classList.remove('glowing');
           // this.fireChangeEvent();
        }  
    }

    checkTelInput() {        
        const tel = this.shadowRoot.querySelector('sl-input[label="Số điện thoại"]');
        this.contactData.tel = tel.value;
        if (!this.isVietnamesePhoneNumber(tel.value) && tel.value!="") {
            this.notify("Incorrect phone format!", "warning", "exclamation-triangle" );
            tel.classList.add('glowing');
        } else {
            tel.classList.remove('glowing');
        }  
    }

    validateEmail(email) {
        // More sophisticated regular expression based on RFC 5322 official standard
        const emailRegex = /^(?=.{1,64}@.{4,255}$)(?!.*\.\.)(?!(^|[^\\])@.*\.\.)([a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+)@([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})$/;
      
        return emailRegex.test(email);
      }

    isVietnamesePhoneNumber(number) {
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
        const deliver_time = this.shadowRoot.querySelector('#deliver_time');
        console.log(value);
        const number = new Date(value).getTime();
        const Min = new Date(this.DeliverTime).getTime();
        const Max = new Date(this.MaxTime).getTime();
        console.log(number);
        if (number<Min || value=="") {        
            deliver_time.classList.add('glowing'); 
            console.log(deliver_time.classList);
            this.notify("Yêu cầu giao hàng quá sớm!", "warning", "exclamation-triangle" );
           
        } else if (number>Max) {
            this.notify("Yêu cầu giao hàng quá xa trong tương lai!", "warning", "exclamation-triangle" );
            deliver_time.classList.add('glowing');
            console.log(deliver_time.classList);
        } else deliver_time.classList.remove('glowing');

    }
   
    //container = document.querySelector('.alert-toast-wrapper');
  
    // Always escape HTML for text arguments!
    escapeHtml(html) {
      const div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    }
  
    // Custom function to emit toast notifications

    notify(message, variant = 'primary', icon = 'info-circle', duration = 4000) {
      const alert = Object.assign(document.createElement('sl-alert'), {
        variant,
        closable: true,
        duration: duration,
        countdown: "rtl",
        innerHTML: `
          <sl-icon name="${icon}" slot="icon"></sl-icon>
          ${this.escapeHtml(message)}
        `
      });
      console.log(`vao notify`);
      this.shadowRoot.append(alert);
      return alert.toast();
    }

    fireChangeEvent() {
        const event = new CustomEvent('contactUpdated', {
            detail: { contactData: {
                                    name: this.contactData.name,
                                    tel: this.removeAlltSpaces(this.contactData.tel),
                                    email: this.contactData.email,
                                    time: this.DeliverTime,
                                    address: this.contactData.address,
                                    } 
                    }
        });
        this.dispatchEvent(event);
      }

  }

  customElements.define('contact-form', ContactForm);
