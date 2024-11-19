class PhotoAlbum extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

    //   const shoelace_style = document.createElement("link");
    //   shoelace_style.href = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/themes/light.css";
    //   shoelace_style.rel = "stylesheet";
    //   document.head.appendChild(shoelace_style);

    //   const font_awesome = document.createElement("link");
    //   font_awesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    //   font_awesome.rel = "stylesheet";
    //   document.head.appendChild(font_awesome);

    //   const shoelace_js = document.createElement("script");
    //   shoelace_js.href = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.17.1/cdn/shoelace-autoloader.js";
    //   shoelace_js.rel = "javascript";
    //   document.head.appendChild(shoelace_js);

      this.selectedItems = [];
      this.filteredItems = [];
      this.searchTerm = '';
      this.selectedCategory = '';
      this.lastScrollTop = 0;

    }

    connectedCallback() {
      this.render();
    }

    set items(data) {
      this._items = data;
      this.filteredItems = data;
      this.updateGrid();
      this.populateCategoryDropdown();
    }

    get items() {
      return this._items || [];
    }

    set setSelectedItems(data) {
        this.selectedItems = data;
        this.updateGrid();
    }
  
    get getSelectedItems() {
        return this.selectedItems || [];
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>        

          .container {
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
            background-color: #D5D8DC;
          }

          .filter-bar {    
            position: sticky;
            top: 0;
            background-color: #D5D8DC;
            
            z-index: 10;
            padding: 10px 10px 10px 10px;
            display: flex;
            justify-content: space-between;
            
            min-width: 200px;
          }

          .filter-bar-line1 {
          
          }

          .filter-bar-line2 {
          
          }

            .sticky_hidden {                
                display: none;
            }

          .album-grid {
            flex: 1;
            overflow-y: auto;
            padding: 5px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 4px;
          }

          #category-select::part(form-control) {
            min-width:130px;
            max-width:45vw;
          }

          #search-input::part(form-control) {
            max-width:45vw;
            min-width:130px;
          }

          .album-grid::-webkit-scrollbar {
                display: none;
            }

            /* Hide scrollbar for IE, Edge and Firefox */
            .album-grid {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }

          .album-item {
            border: 3px solid #fff;
            position: relative;
            overflow: hidden;
            height: 290px;
            display:flex;
            flex-direction: column;          
            align-items: center;
            border-radius: 20px;
            border: 1px solid #D7A9A8;
          }

          .album-item.selected {
            opacity: 1;
            background-color: #F1C40F;
            border: 1px solid #16800C;
          }

          .album-item img {
            width: 100%;
            height: 220px;
            object-fit: cover;
          }

          .info-button {
            position: absolute;
            top: 5px;
            right: 5px; 
            border: none;
            cursor: pointer;
            z-index: 5;
            opacity:0.9;
            border-radius: 50%;
            padding: 10px 10px 5px 10px;
            background-color: rgba(200, 200, 200, 0.9);
            font-size: 22px;
          }

          .item-id {
            position: absolute;
            top: 10px;
            border: none;
            z-index: 5;
            padding: 2px 2px 2px 2px;
            background-color: rgba(200, 200, 200, 0.9);
            font-size: 16px;
            opacity: 0.7;
            border-radius: 5px;
          }

            .itemInfo {   
                display:flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items:flex-start;
                width: 100%;       
                max-height: 75px;  
                color: #2E4053;  
                opacity:0.8;  
            }

            .itemInfo_Name {
                padding: 5px 10px 0px 10px;
                font-size: 0.9rem;
                text-align: left;
                overflow: hidden;       
                max-height:35px;
  
            }

            .itemInfo_Price {
                padding: 5px 10px 5px 10px;
                font-size: 1.1rem;
                color: red;
                text-align: left;
            }

          .tick {
            position: absolute;
            top: 5px;
            left: 5px;
            background-color: #345635;
            color: white;
            border-radius: 50%;
            padding: 10px 10px 5px 10px;
            font-size: 22px;
            opacity: 0.9;
          }

          .quantity-selector {
            display: flex;
            position: absolute;
            top: 185px;
            font-size: 1rem;
            width: 100px;
            flex-direction: row;
            justify-content: center;
            opacity:0.9;
          }
          .quantity-selector input {        
            text-align: center;
            height: 20px;         

          }
          .quantity-selector button {
            cursor: pointer;
            flex-grow:1;
          }

          .hidden {
            display:none;
          }
        </style>          
  
        <div class="container">
          <div class="filter-bar">
                <sl-select class="filter-item" size="small" id="category-select">
                    <sl-option value="">Tất cả danh mục</sl-option>
                </sl-select>                      
                <sl-input class="filter-item" size="small" type="text" id="search-input" placeholder="Search by name or description"></sl-input>        
          </div>
          <div class="album-grid"></div>
        </div>
        
      `;

      this.shadowRoot.querySelector('#search-input').addEventListener('sl-input', (e) => {
        this.searchTerm = e.target.value;
        this.updateGrid();
      });

      this.shadowRoot.querySelector('#category-select').addEventListener('sl-change', (e) => {
        this.selectedCategory = e.target.value;
        this.updateGrid();
      });

    //   this.shadowRoot.querySelector('#clear-selection').addEventListener('click', () => {
    //     if (confirm('Are you sure you want to clear all selections?')) {
    //       this.selectedItems = [];
    //       this.updateGrid();
    //       this.fireChangeEvent();          
    //     }
    //   });

      const searchBar =  this.shadowRoot.querySelector('.filter-bar');

//       this.shadowRoot.querySelector('.album-grid').addEventListener("scroll", function(e){ // or window.addEventListener("scroll"....
// //console.log(e);
//         const st = this.scrollTop;
//        // var st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
//        // console.log(st);
//         if (st > this.lastScrollTop) {
//            // downscroll code
//            //console.log(`scroldown`);
//           // console.log(searchBar);
//            searchBar.classList.add('sticky_hidden');
//            //enterFullScreen();
//         } else if (st < this.lastScrollTop) {
//            // upscroll code
//           // console.log(`scrollup`);
//           // console.log(searchBar);
//            searchBar.classList.remove('sticky_hidden');
//            //exitFullScreen();
//         } // else was horizontal scroll
//         this.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
//      }, false);

      this.updateGrid();
    }

    populateCategoryDropdown() {
      const categorySelect = this.shadowRoot.querySelector('#category-select');
      const categories = [...new Set(this.items.map(item => item.category))];
      categories.forEach(category => {
        let sl_optionHtml=`<sl-option value="${category}">${category}</sl-option>`;
        categorySelect.insertAdjacentHTML('beforeend', sl_optionHtml);

        // const option = document.createElement('sl-option');
        // option.value = category;
        // option.textContent = category;
        // categorySelect.appendChild(option);
      });
    }

    updateGrid() {
      const grid = this.shadowRoot.querySelector('.album-grid');
      grid.innerHTML = '';

      const filteredItems = this.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                              item.description.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = this.selectedCategory ? item.category === this.selectedCategory : true;
        return matchesSearch && matchesCategory;
      });
      //console.log(`searchTerm `, this.searchTerm);
      //console.log(`selectedCategory `, this.selectedCategory);
      //console.log(filteredItems);
      filteredItems.forEach(item => {
        const albumItem = document.createElement('div');
        albumItem.classList.add('album-item');
        if (this.isItemSelected(item.id)) {
          albumItem.classList.add('selected');
        }
        // <div>${item.name.split('-')[1].split('_')[0].split('.')[0]}</div>
        albumItem.innerHTML = `
          <span class="tick hidden"> <sl-icon name="check-lg"></sl-icon></span>
          <img src="${item.url[0]}" alt="${item.name}">    
          <div class="itemInfo">
            <div class="itemInfo_Name">${item.name.split('-')[0]}</div>
            <div class="itemInfo_Price">${addDotToNumber(item.price)}
                <span style="font-size: 0.8rem; color: #2E4053;">/ ${item.unit}</span></div>
          </div>
         <span class="item-id">${item.id}</span></div>
          <span class="info-button"><sl-icon name="three-dots"></sl-icon></span>
      
            <quantity-selector class="quantity-selector hidden" value="${this.getItemQuantity(item.id)}"></quantity-selector>
           
        `;


        // <sl-button size="small" class="decrease-btn"><sl-icon size="large" name="dash-lg"></sl-icon></sl-button>
        // <sl-input size="small"  no-spin-buttons style="width: 50%" type="number" value="${this.getItemQuantity(item.id)}" min="1"></sl-input>
        // <sl-button size="small" class="increase-btn"><sl-icon size="large" name="plus-lg"></sl-icon></sl-button>
        // Info Button Click Event
        albumItem.querySelector('.info-button').addEventListener('click', (e) => {
          e.stopPropagation();  // Prevent parent click
          alert(`Info for ${item.name}:\n\nDescription: ${item.description}\nID: ${item.id}`);
        });

        

        // Quantity Button Events
        // const decreaseBtn = albumItem.querySelector('.decrease-btn');
        // const increaseBtn = albumItem.querySelector('.increase-btn');
        //const quantityInput = albumItem.querySelector('sl-input[type="number"]');
        const quantity_selector = albumItem.querySelector('quantity-selector');

       // console.log(quantityInput);
       
        quantity_selector.addEventListener('valueChanged', (e) => {
            console.log(`quantity_selector change ${e.detail.value}`);
            if (e.detail.value==0) {
                this.removeItemFromSelection(item.id);
                this.updateSingleItem(albumItem, item.id);
            }
            this.updateItemQuantity(item.id,e.detail.value);    
            this.fireChangeEvent();      
        });

        quantity_selector.addEventListener('click', (e) => {
            e.stopPropagation();    
        });

        quantity_selector.addEventListener('dblclick', (e) => {
            e.stopPropagation();    
        });

        



        albumItem.addEventListener('dblclick', () => {
          if (!this.isItemSelected(item.id)) {
            this.addItemToSelection(item.id);
            this.resetQuality(albumItem,item.id,1);            
            
          } else {
            this.removeItemFromSelection(item.id);
            this.resetQuality(albumItem,item.id,0);
          }

          this.updateSingleItem(albumItem, item.id);
          this.fireChangeEvent();
        });

        this.updateSingleItem(albumItem,item.id);

        grid.appendChild(albumItem);

      });
    }

    updateSingleItem(albumItem, itemId) {
        const quantity_selector = albumItem.querySelector('quantity-selector');
      if (this.isItemSelected(itemId)) {
        albumItem.classList.add('selected');
        //albumItem.querySelector('.quantity-selector').classList.remove('hidden');
        quantity_selector.classList.remove('hidden');
        albumItem.querySelector('.tick').classList.remove('hidden');
        // albumItem.querySelector('.tick').style.display = 'block';
      } else {
        albumItem.classList.remove('selected');
        //albumItem.querySelector('.quantity-selector').classList.add('hidden');
        quantity_selector.classList.add('hidden');
        albumItem.querySelector('.tick').classList.add('hidden');       
      }
    }

    isItemSelected(itemId) {       
      return this.selectedItems.some(item => item.id === itemId);
    }

    addItemToSelection(itemId) {
      const selectedItem = this.items.find(item => item.id === itemId);
      if (selectedItem) {
        this.selectedItems.push({ ...selectedItem, number: 1 });
      }         
    }

    removeItemFromSelection(itemId) {
        const selectedItem = this.items.find(item => item.id === itemId);
        if (selectedItem) {
            this.selectedItems = this.selectedItems.filter(obj => obj.id != itemId);
        }       
    }

    resetQuality(albumItem,itemId,value) {
        //const quantityInput = albumItem.querySelector('sl-input[type="number"]');
        //quantityInput.value = value;
        const quantity_selector = albumItem.querySelector('quantity-selector');
        quantity_selector.value = value;
        this.updateItemQuantity(itemId, value);
    }

    getItemQuantity(itemId) {
      const selectedItem = this.selectedItems.find(item => item.id === itemId);
      return selectedItem ? selectedItem.number : 1;
    }

    updateItemQuantity(itemId, quantity) {
      const selectedItem = this.selectedItems.find(item => item.id === itemId);
      if (selectedItem) {
        selectedItem.number = parseInt(quantity);
      }
    }

    fireChangeEvent() {
        const event = new CustomEvent('itemSelected', {
            detail: { selectedItems: this.selectedItems,
                total: this.calculateTotal(),
             }
            });
        this.dispatchEvent(event);
    }

   

    calculateTotal() {
        let total=0;
        for (let i=0;i<this.selectedItems.length;i++) {
            total = total + (this.selectedItems[i].number * this.selectedItems[i].price);
        }
        return total;
    }
  }

  customElements.define('photo-album', PhotoAlbum);


//   decreaseBtn.addEventListener('click', (e) => {
//     console.log(e);
//   e.stopPropagation();  // Prevent parent click
//   if (quantityInput.value > 1) {
//     quantityInput.value = parseInt(quantityInput.value) - 1;
//     this.updateItemQuantity(item.id, quantityInput.value);
//   }

//   this.fireChangeEvent();

// });

// decreaseBtn.addEventListener('dblclick', (e) => {          
//   e.stopPropagation();  // Prevent parent double click         
// });

// increaseBtn.addEventListener('click', (e) => {
//     console.log(e);
//   e.stopPropagation();  // Prevent parent click
//   quantityInput.value = parseInt(quantityInput.value) + 1;
//   this.updateItemQuantity(item.id, quantityInput.value);

//   this.fireChangeEvent();
// });

// increaseBtn.addEventListener('dblclick', (e) => {          
//     e.stopPropagation();  // Prevent parent double click         
//   });

// quantityInput.addEventListener('input', (e) => {
//     console.log(e);
//   e.stopPropagation();  // Prevent parent click
//   if (quantityInput.value >= 1) {
//     this.updateItemQuantity(item.id, quantityInput.value);
//   }

//   this.fireChangeEvent();

// });

// quantityInput.addEventListener('dblclick', (e) => {          
//     e.stopPropagation();  // Prevent parent double click         
// });

// quantityInput.addEventListener('click', (e) => {
//     console.log(e);
//   e.stopPropagation();  // Prevent parent click
//   if (quantityInput.value >= 1) {
//     this.updateItemQuantity(item.id, quantityInput.value);
//   }

//   this.fireChangeEvent();

// });