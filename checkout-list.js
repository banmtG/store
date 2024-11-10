class CheckoutList extends HTMLElement {
    constructor() {

      super();
      this.attachShadow({ mode: 'open' });

      //variables used to store properties of Components
      this.total = 0;
      this.selectedItems = [];
      this.filteredItems = [];
      this.searchTerm = '';
      this.selectedCategory = '';
      this.lastScrollTop = 0;
      this.listStyle = 'shopee';
      this.componentCSS = `<link rel="stylesheet" href="./checkout-list.css" />`;
      this.CSSJSlibraries =` <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/light.css" />
      <script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/shoelace-autoloader.js"></script>`;
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
           <span class="checklist_Title">Đơn hàng</span>           
           <div class="checklist_Total">${this.addDotToNumber(this.total)}</div>           
          </div>
          <div class="item_list"></div>
          <div class="footer">           
          </div>  
        </div>
        `;

      // DECLARE DIVs inside the component skeleton for later use
      const container=this.shadowRoot.querySelector('.container');
      const header=this.shadowRoot.querySelector('.header');
      const item_list=this.shadowRoot.querySelector('.item_list');
      const footer=this.shadowRoot.querySelector('.footer');


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
              <span>${index+1}</span> 
            </div>          
            <div class="item_container_img">
              <img src="${item.url[0]}" alt="${item.name}">
            </div>
            <div class="item_info">                
              <span>  ${item.name}</span>
              <quantity-selector value=${item.number}></quantity-selector>             
            </div>
             <div class="item_deleteBtn">            
                ⛔             
            </div>         
          </div>
        `;

         // DECLARE DIVs inside the item skeleton for later use
         const item_container = listItem.querySelector('.item_container');
         const item_deleteBtn = listItem.querySelector('.item_deleteBtn');
         const quantity_selector = listItem.querySelector('quantity-selector');

        // ADD addEventListener FOR EACH div/button declared in this skeleton.
        item_deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeItemFromSelection(item.id);
            this.updateList();
            this.fireChangeEvent();
        });

        // quantity_selector.addEventListener('valueChanged', (e) => {
        //   this.updateItemQuantity(item.id,e.detail.value);          
        // });
    
        quantity_selector.addEventListener('valueChanged', (e) => {
          console.log(`quantity_selector change ${e.detail.value}`);
          if (e.detail.value==0) {
              this.removeItemFromSelection(item.id);
              this.updateList();
              //this.updateSingleItem(albumItem, item.id);
          }
          this.updateItemQuantity(item.id,e.detail.value);    
          this.fireChangeEvent();      
      });

       
        // Update APPEARANCE of this Item based on data passed - this is necessary when giving new data to the whole list from outside world. This needs 2 variables the DOM element and the position in the new data
        //this.updateSingleItem(listItem,item.id); 

        // Append the COOKED ITEM to the list
        item_List.appendChild(listItem);

      });
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

    isItemSelected(itemId) {       
      return this.selectedItems.some(item => item.id === itemId);
    }

    addItemToSelection(itemId) {
      // const selectedItem = this.items.find(item => item.id === itemId);
      // if (selectedItem) {
      //   this.selectedItems.push({ ...selectedItem, number: 1 });
      // }         
    }

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
    }

    calculateAndUpdateTotal() {
      let total=0;
      for (let i=0;i<this.selectedItems.length;i++) {
          total = total + (this.selectedItems[i].number * this.selectedItems[i].price);
      }

      const checklist_Total=this.shadowRoot.querySelector('.checklist_Total');
      checklist_Total.innerHTML=this.addDotToNumber(total);

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
    

  }

  customElements.define('checkout-list', CheckoutList);
