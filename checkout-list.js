class CheckoutList extends HTMLElement {
    constructor() {

      super();
      this.attachShadow({ mode: 'open' });

      //variables used to store properties of Components
      this.total = 0;
      this.selectedItems = [];
      this.checkedItems = [];
      this.filteredItems = [];
      this.searchTerm = '';
      this.selectedCategory = '';
      this.lastScrollTop = 0;
      this.listStyle = 'shopee';
      this.componentCSS = `<link rel="stylesheet" href="./checkout-list.css" />`;
      this.CSSJSlibraries = ``;
      // this.CSSJSlibraries =` <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/light.css" />
      // <script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/shoelace-autoloader.js"></script>`;
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
        if (name === 'data') {
          this.selectedItems = newValue;          
          this.updateList();  
        }
    }

    changeCssStyle(style) {
      if (style === 'shopee') { 
        console.log('style = shopee');
      }
    }

// write BOTH GETTER AND SETTER methods to interact with outside world //////////////////////////
    set items(data) {
      this._items = data; // underscore for private denotes
      this.selectedItems = data.selectedItems; // setup initial filter data the same as whole set.
      this.total = data.total;
      //just render parts of the component that is data-dependent
      this.render();      
    }

    get items() {
      return this._items || [];
    }

    set setSelectedItems(data) {
        this.selectedItems = data;
        this.updateList();
    }
  
    get getSelectedItems() {
        return this.selectedItems || [];
    }

// FUNCTION METHODS OF THE COMPONENT /////////////////////////////////////////////////////////
    render() {
      // MAIN HTML SKELETON OF THE COMPONENT
      this.shadowRoot.innerHTML = `${this.componentCSS}${this.CSSJSlibraries}
        <div class="container">
          <div class="header">
           <span class="checklist_Title">Danh sách có ${this.selectedItems.length} món</span>           
           <div class="checklist_Total">${this.addDotToNumber(this.total)}</div>           
          </div>
          <div class="item_list"></div>
          <div class="footer">   
             <sl-button class="backBtn" variant="default" size="small">
                <sl-icon slot="prefix" name="backspace"></sl-icon>Quay lại 
             </sl-button>  
             <sl-button class="selectAllOnOff" variant="default" size="small">
                <sl-icon slot="prefix" name="stars"></sl-icon>
                <span class="selectAllOnOff_span">Chọn hết</span>
             </sl-button>
             <sl-button class="nextBtn" variant="default" size="small">
                <sl-icon slot="suffix" name="backspace-reverse"></sl-icon>Tiếp theo
             </sl-button>        
          </div>  
        </div>
        <dialog-component></dialog-component>
        `;

      // DECLARE DIVs inside the component skeleton for later use
      const container=this.shadowRoot.querySelector('.container');
      const header=this.shadowRoot.querySelector('.header');
      const item_list=this.shadowRoot.querySelector('.item_list');
      const footer=this.shadowRoot.querySelector('.footer');
      const backBtn=this.shadowRoot.querySelector('.backBtn');
      const selectAllOnOff=this.shadowRoot.querySelector('.selectAllOnOff');
      const selectAllOnOff_span=this.shadowRoot.querySelector('.selectAllOnOff_span');

      // const dialog_clearAll = this.shadowRoot.querySelector('.dialog_clearAll');
      //const confirmBtn_clearAll = dialog_clearAll.querySelector('sl-button[name="confirmBtn_clearAll"]');
      backBtn.addEventListener('click', () => {
        this.fireRemoveEvent();
      });


      selectAllOnOff.addEventListener('click', () => {   
        if (selectAllOnOff_span.innerText === "Bỏ chọn hết")
        {
          selectAllOnOff_span.innerText = "Chọn hết";
          this.checkedItems = [];
        } else 
        {
          selectAllOnOff_span.innerText = "Bỏ chọn hết";
          this.checkedItems = this.selectedItems.slice();
        }
        this.updateList(); 
        this.fireChangeEvent(); 
          
      });

      // //openButton.addEventListener('click', () => dialog.show());
      // confirmBtn_clearAll.addEventListener('click', () =>{
      //     this.selectedItems = [];          
      //     this.updateList(); 
      //     this.fireChangeEvent(); 
      //     this.fireRemoveEvent();
      //     dialog_clearAll.hide();          
      // });

      // const cancelBtn_clearAll = dialog_clearAll.querySelector('sl-button[name="cancelBtn_clearAll"]');
      // //openButton.addEventListener('click', () => dialog.show());
      // cancelBtn_clearAll.addEventListener('click', () =>{
      //   dialog_clearAll.hide();
      // });

      // backBtn.addEventListener('click', ()=>{
      //   this.fireRemoveEvent();
      // })

      // clearBtn.addEventListener('click', ()=>{
      //   dialog_clearAll.show();
      //   //this.notify("Bạn có chắc xóa hết đơn hàng", "warning", "exclamation-triangle" );
      // })



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
      this.updateList();
    }

    //METHODS TO UPDATE INTERFACE PARTS (EACH METHOD FOR EACH PART)
    populateCategoryDropdown() {
      // const categorySelect = this.shadowRoot.querySelector('#category-select');
      // const categories = [...new Set(this.items.map(item => item.category))];
      // categories.forEach(category => {
      //   let sl_optionHtml=`<sl-option value="${category}">${category}</sl-option>`;
      //   categorySelect.insertAdjacentHTML('beforeend', sl_optionHtml);
      // });
    }

    updateList() {
      const item_List=this.shadowRoot.querySelector('.item_list');
      item_List.innerHTML = ''; //clear previous HTML   

      // create each ITEM by literating through data
      this.selectedItems.forEach((item,index) => {
        const listItem = document.createElement('div'); // Create a listItem Div

        // Add class for it, can add multiple class based on the passed properties 
        listItem.classList.add('list-item'); 

        // setup item HTML skeleton
        listItem.innerHTML = `
          <div class="item_container">
           <div class="item_orderNumber">
              <input type="checkbox">
            </div>          
            <div class="item_container_img">
              <img src="${item.url[0]}" alt="${item.name}">
            </div>
            <div class="item_info">                
              <span>  ${item.name} (${item.unit}) </span>
              <div class="item_info_quantity_price">
                <div class="item_info_quantity_unitprice">
                  <quantity-selector value=${item.number}></quantity-selector>
                  <div>x${this.addkToNumber(item.price)}</div>
                </div>
                <div>${this.addkToNumber(item.number*item.price)}</div>
              </div>
            </div>
             <div class="item_deleteBtn">            
                <button class="transparentBtn">⛔</button>
            </div>         
          </div>
        `;

         // DECLARE DIVs inside the item skeleton for later use
         const item_container = listItem.querySelector('.item_container');
         const item_deleteBtn = listItem.querySelector('.item_deleteBtn');
         const quantity_selector = listItem.querySelector('quantity-selector');
         const checkbox_area = listItem.querySelector('.item_orderNumber');
         const checkbox = checkbox_area.querySelector('input[type="checkbox"]');
         const item_container_img = listItem.querySelector('.item_container_img');



        if (this.isItemChecked(item.id)) {
          item_container.classList.add('item_checked');
          checkbox.checked = true;
        }

        item_container_img.addEventListener('click',(e)=> {
          e.stopPropagation();
          if (checkbox.checked) { 
            //checkbox.checked = false; 
            this.removeItemFromCheckedList(item.id);     
          } 
          else {
            //checkbox.checked=true;
            this.addItemToCheckedList(item.id);               
          }        
          this.updateList();
        })

        checkbox.addEventListener('click',(e)=> {   
          e.stopPropagation();
          if (!checkbox.checked) { 
            this.removeItemFromCheckedList(item.id);     
          } 
          else {
            //checkbox.checked=true;
            this.addItemToCheckedList(item.id);               
          }         
          this.updateList();
          //checkbox_area.click();
        });


        checkbox_area.addEventListener('click',(e)=> {
          e.stopPropagation();
          if (checkbox.checked) { 
            //checkbox.checked = false; 
            this.removeItemFromCheckedList(item.id);     
          } 
          else {
            //checkbox.checked=true;
            this.addItemToCheckedList(item.id);               
          }        
          this.updateList();
        })

         //console.log(checkbox_area);
         //console.log(checkbox);
        // ADD addEventListener FOR EACH div/button declared in this skeleton.
        
        item_deleteBtn.addEventListener('click', (e) => {
          setTimeout(()=> { 
            e.stopPropagation();    
            console.log(e);        
            this.handleDelete(item.id);        
          },500)   
        });


        quantity_selector.addEventListener('valueChanged', (e) => {
           // if nam chung danh sach
           if (this.isItemChecked(item.id) && this.checkedItems.length>1) {
            this.handleQuantityChangeGroup(item.id,e.detail.value);
           } else { // neu nam rieng 1 minh
            this.handleQuantityChangeOne(item.id,e.detail.value);
           }
             
       });

        // quantity_selector.addEventListener('valueChanged', (e) => {
        //   this.updateItemQuantity(item.id,e.detail.value);          
        // });
    
       

       
        // Update APPEARANCE of this Item based on data passed - this is necessary when giving new data to the whole list from outside world. This needs 2 variables the DOM element and the position in the new data
        //this.updateSingleItem(listItem,item.id); 

        // Append the COOKED ITEM to the list
        item_List.appendChild(listItem);

      });
    }

  async openConfirmation_clearOne(value) {
      // const htmlDialog=`<dialog-component class="dClearOne"></dialog-component>`;
      // const container = document.createElement('div');
      //   container.innerHTML = htmlDialog;
      // this.shadowRoot.appendChild(container);
      // const dialog = container.firstElementChild;

      const dialog = this.shadowRoot.querySelector('dialog-component');    
      const userConfirmed = await dialog.show(
          {
              label : "Xác nhận", 
              message : `<sl-icon name="exclamation-triangle"></sl-icon><span>${value}</span>`,
              okbtn : "Đồng ý",
              cancelbtn : "Không", 
              closeOnOverlay : true
          });                          
      //console.log(userConfirmed);     
      return userConfirmed;
  }

  async openConfirmation_clearAll() {
    const dialog = this.shadowRoot.querySelector('dialog-component');    
    const userConfirmed = await dialog.show(
        {
            label : "Xác nhận", 
            message : `<sl-icon name="exclamation-triangle"></sl-icon><span>Xóa hết danh sách?</span>`,
            okbtn : "Đồng ý",
            cancelbtn : "Không", 
            closeOnOverlay : true
        });                          
    //console.log(userConfirmed);     
    return userConfirmed;
}

    async openConfirmation_Group() {
      const dialog = this.shadowRoot.querySelector('dialog-component');    
      const userConfirmed = await dialog.show(
          {
              label : "Xác nhận", 
              message : `<sl-icon name="exclamation-triangle"></sl-icon><span>Chọn cùng số lượng cho ${this.checkedItems.length} loại?</span>`,
              okbtn : "Đồng ý",
              cancelbtn : "Không", 
              closeOnOverlay : true
          });                          
      //console.log(userConfirmed);     
      return userConfirmed;
    }


  // dialog.addEventListener('resovleEvent', (event) => {
  //     console.log(event.detail.result);
  // })

    handleDelete(itemId) {
      let notification_string = "";
      if (this.isItemChecked(itemId) && this.checkedItems.length>1) { notification_string = `Bạn có muốn xóa ${this.checkedItems.length} loại?`; 
     } else notification_string = `Bạn có muốn xóa ${this.getItemObject(itemId).name} (${this.getItemObject(itemId).unit})`;
     this.openConfirmation_clearOne(notification_string).then((result)=> {
       if (result==true) {
           if (this.isItemChecked(itemId)) {
             for (let i=0;i<this.checkedItems.length;i++)
               this.removeItemFromSelection(this.checkedItems[i].id);
             this.checkedItems = [];
           }
           else { this.removeItemFromSelection(itemId); }
           this.updateList();
           this.fireChangeEvent(); 
       }
     });  

    }

    handleQuantityChangeGroup(itemId,value) {
      this.openConfirmation_Group().then((result)=> {
        console.log(result);
          if (result==true) {
                if (value==0) { // neu bang 0
                  console.log('=0');
                  //console.log('vao 0');
                  this.openConfirmation_clearOne(`Bạn có muốn xóa ${this.checkedItems.length} loại?`).then((result)=> {
                    console.log(result);
                    if (result==true) {
                        if (this.isItemChecked(itemId)) {
                          console.log('vao day');
                          for (let i=0;i<this.checkedItems.length;i++) {   
                            this.removeItemFromSelection(this.checkedItems[i].id);
                          }
                          this.checkedItems = [];                   
                        }
                        else { this.removeItemFromSelection(itemId); }
                        this.updateList();
                        this.fireChangeEvent(); 
                    } else {        
                      console.log(`vao false update 1 thoi`);         
                      this.updateNumberofItem(itemId,1);   
                      this.updateList();
                      this.fireChangeEvent(); 
                    }
                  });  
      
                } else { // neu > 0
                  console.log('>0');
                  console.log(value);
                  for (let i=0;i<this.checkedItems.length;i++) {
                    this.updateNumberofItem(this.checkedItems[i].id,value);         
                  }
                  this.updateList();
                  this.fireChangeEvent();    
                }
            } else {
              this.handleQuantityChangeOne(itemId,value);
            }
        });
    }

    handleQuantityChangeOne(itemId,value) {
      console.log(`vao handleQuantityChangeOne`);
      if (value==0) { // neu bang 0
        //console.log('vao 0');
        let item_Name = `${this.getItemObject(itemId).name} (${this.getItemObject(itemId).unit})`;
        this.openConfirmation_clearOne(`Bạn có muốn xóa ${item_Name}?`).then((result)=> {
          console.log(result);
          if (result==true) {
              this.removeItemFromSelection(itemId); 
              this.removeItemFromCheckedList(itemId); 
              this.updateList();
              this.fireChangeEvent(); 
          } else {
            console.log('vao update 1 cho 1 item');
            this.updateNumberofItem(itemId,1);   
            this.updateList();
            this.fireChangeEvent(); 
          }
        });  
      } else {
      // neu > 0 
      this.updateItemQuantity(itemId,value);   
      this.updateList();
      this.fireChangeEvent(); 
      }
    }

    isItemChecked(itemId) {   
      //console.log(this.checkedItems.some(item => item.id === itemId));    
      return this.checkedItems.some(item => item.id === itemId);
    }
    
    removeItemFromCheckedList(itemId) {      
     // console.log(this.checkedItems);     
      const item = this.checkedItems.find(item => item.id === itemId);
     // console.log(item);
      if (item) {
          this.checkedItems = this.checkedItems.filter(obj => obj.id != itemId);
      }       

      const selectAllOnOff_span=this.shadowRoot.querySelector('.selectAllOnOff_span');

      if (this.checkedItems.length ===0) 
      {        
        selectAllOnOff_span.innerText = "Chọn hết";       
      } 

      //console.log(this.checkedItems);
    }

    addItemToCheckedList(itemId) {
    
      const item = this.selectedItems.find(item => item.id === itemId);
      if (item) {
        this.checkedItems.push({ ...item, number: 1 });
      }    

      const selectAllOnOff_span=this.shadowRoot.querySelector('.selectAllOnOff_span');
      console.log(this.selectedItems.length);
      console.log(this.checkedItems.length);
      if (this.selectedItems.length == this.checkedItems.length) 
      {        
        selectAllOnOff_span.innerText = "Bỏ chọn hết";      
      } 
    }

    updateNumberofItem(itemId,value) {
      const item = this.selectedItems.find(item => item.id === itemId);
      if (item) {
        item.number = value;
      }    
    }

    updateSingleItem(listItem, itemId) {
      // update Interface with logic and classList.add/remove classes
      if (this.isItemSelected(itemId)) {
        // albumItem.classList.add('selected');
        // albumItem.querySelector('.quantity-selector').classList.remove('hidden');
        // albumItem.querySelector('.tick').classList.remove('hidden');
        // albumItem.querySelector('.tick').style.display = 'block';
      } else {
        // albumItem.classList.remove('selected');
        // albumItem.querySelector('.quantity-selector').classList.add('hidden');
        // albumItem.querySelector('.tick').classList.add('hidden');       
      }
    }

    // isItemSelected(itemId) {       
    //   return this.selectedItems.some(item => item.id === itemId);
    // }

    removeItemFromSelection(itemId) {  
      const selectedItem = this.selectedItems.find(item => item.id === itemId);
      if (selectedItem) {
          this.selectedItems = this.selectedItems.filter(obj => obj.id != itemId);
      }       
    }


    resetQuality(albumItem,itemId,value) {
        // const quantityInput = albumItem.querySelector('sl-input[type="number"]');
        // quantityInput.value = value;
        // this.updateItemQuantity(itemId, value);
    }

    getItemQuantity(itemId) {
      // const selectedItem = this.selectedItems.find(item => item.id === itemId);
      // return selectedItem ? selectedItem.number : 1;
    }

    getItemObject(itemId) {
      return this.selectedItems.find(item => item.id === itemId);
    }

    updateItemQuantity(itemId, quantity) {
      const selectedItem = this.selectedItems.find(item => item.id === itemId);
      if (selectedItem) {
        selectedItem.number = parseInt(quantity);
      }
      this.fireChangeEvent();
    }

    fireChangeEvent() {
      const event = new CustomEvent('itemSelected', {
          detail: { selectedItems: this.selectedItems,
              total: this.calculateAndUpdateTotal(),
           }
          });
      this.dispatchEvent(event);
      if (this.selectedItems.length==0) this.fireRemoveEvent();
    }

    fireRemoveEvent() {
      const event = new CustomEvent('removeCheckout', {
          detail: { selectedItems: this.selectedItems,
              total: this.calculateAndUpdateTotal(),
           }
          });
      this.dispatchEvent(event);
    }

    calculateAndUpdateTotal() {
      let total=0;
      for (let i=0;i<this.selectedItems.length;i++) {
          total = total + (this.selectedItems[i].number * this.selectedItems[i].price);
      }

      const checklist_Total=this.shadowRoot.querySelector('.checklist_Total');
      checklist_Total.innerHTML=this.addDotToNumber(total);
      const checklist_Title=this.shadowRoot.querySelector('.checklist_Title');
      checklist_Title.innerHTML=`Danh sách có ${this.selectedItems.length} món`;

      return total;
    } 

    addDotToNumber(number) {
      let str=number.toString();
      let parts = [];
      let digitN=str.length;
      while (digitN>3) {           
          parts.push(str.substring(digitN-3,digitN));
          str = str.substring(0,digitN-3);
          digitN=str.length;
      }
      if (digitN>0) parts.push(str);
      return `đ ${parts.reverse().join('.')}`;
    }

    addkToNumber(number) {
      let thousand=number/1000;
      let str=thousand.toString();
      let parts = [];
      let digitN=str.length;
      while (digitN>3) {           
          parts.push(str.substring(digitN-3,digitN));
          str = str.substring(0,digitN-3);
          digitN=str.length;
      }
      if (digitN>0) parts.push(str);
      return `${parts.reverse().join('.')}k`;
    }

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
    

  }

  customElements.define('checkout-list', CheckoutList);



//   quantity_selector.addEventListener('valueChanged', (e) => {
//     // console.log(`quantity_selector change ${e.detail.value}`);        

//      // if nam chung danh sach
//      if (this.isItemChecked(item.id)) {
//       this.openConfirmation_Group().then((result)=> {
//        console.log(result);
//          if (result==true) {
//                if (e.detail.value==0) { // neu bang 0
//                  console.log('=0');
//                  //console.log('vao 0');
//                  this.openConfirmation_clearOne().then((result)=> {
//                    console.log(result);
//                    if (result==true) {
//                        if (this.isItemChecked(item.id)) {
//                          for (let i=0;i<this.checkedItems.length;i++)
//                            this.removeItemFromSelection(this.checkedItems[i].id);
//                        }
//                        else { this.removeItemFromSelection(item.id); }
//                        this.updateList();
//                        this.fireChangeEvent(); 
//                    }
//                    if (result==false) {
//                      quantity_selector.value = 1;  
//                    }
//                  });  
     
//                } else { // neu > 0
//                  console.log('>0');
//                  console.log(e.detail.value);
//                  for (let i=0;i<this.checkedItems.length;i++) {
//                    this.updateNumberofItem(this.checkedItems[i].id,e.detail.value);         
//                  }
//                  this.updateList();
//                  this.fireChangeEvent();    
//                }
//            } else {
//              this.updateList();
//              this.fireChangeEvent();   
//            }
//        });
//      } else { // neu nam rieng 1 minh
//        if (e.detail.value==0) { // neu bang 0
//          //console.log('vao 0');
//          this.openConfirmation_clearOne().then((result)=> {
//            console.log(result);
//            if (result==true) {
//                if (this.isItemChecked(item.id)) {
//                  for (let i=0;i<this.checkedItems.length;i++)
//                    this.removeItemFromSelection(this.checkedItems[i].id);
//                }
//                else { this.removeItemFromSelection(item.id); }
//                this.updateList();
//                this.fireChangeEvent(); 
//            }
//            if (result==false) {
//              quantity_selector.value = 1;  
//            }
//          });  

//        } else {
//        // neu > 0 
//        this.updateItemQuantity(item.id,e.detail.value);   
//        this.updateList();
//        this.fireChangeEvent(); 
//        }

//      }
//      // console.log(`update list`);
//      // this.updateList();          
//  });