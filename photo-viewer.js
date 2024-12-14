class PhotoViewer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.componentCSS = `<link rel="stylesheet" href="./photo-viewer.css" /><link rel="stylesheet" href="./transient-effects.css" />`;   

        this._BREAKPOINTS = {
            PHONE_VERTICAL: 480, // Phone (Vertical)
            PHONE_HORIZONTAL: 600, // Phone (Horizontal)
            TABLET_VERTICAL: 768, // Tablet (Vertical)	
            TABLET_HORIZONTAL: 1024, //desktop , Tablet (Horizontal)
            DESKTOP: 1440, //large desktop
            SHORT_SCREEN: 400,  // landscape phones ≤ 400, Standard Screens	> 400  
        };   
        
        //for selection function
        this._selectedItems = [];
    }

    connectedCallback() {
        this.render();  
        this._initialResizeObservers();
    }

    _initialResizeObservers() {
    //resize Observer for Whole Component
        this.resizeObserverWholeComponent = new ResizeObserver((entries) => {
            for (let entry of entries) {
                //console.log(entry.contentRect);
                this._handleResizeWholeComponent(entry.contentRect);
            }
        });    
        this.resizeObserverWholeComponent.observe(this);


    //resize Observer for ControlBar
    //seperate for adjusting part of component independantly
        this.resizeObserverControlBar = new ResizeObserver((entries) => {
            for (let entry of entries) {
               // console.log(entry.contentRect);
                this._handleResizeControlBar(entry.contentRect);
            }
        });    
        this.resizeObserverControlBar.observe(this._controlBar);
    }

    disconnectedCallback() {
      //  this.resizeObserver.disconnect();
      //  this.resizeObserverControlBar.disconnect();
    }

    _determineMinColRow(width,height) {   
       // console.log(this._layout);
        let preferedCol = Math.round(width/this._minTblength);
        let preferedRow = Math.round(height/this._minTblength);

        if (this._layout==="horizontal")
            if (preferedRow%2===0) preferedRow++;
        if (this._layout==="vertical")
            if (preferedCol%2===0) preferedCol++;

        if (this._screen==="tablet_vertical") {
           // if (preferedRow<2) preferedRow=2;
        }

        return {
            minCol:preferedCol,
            minRow:preferedRow,
        }


    }

    _handleResizeControlBar(Rect) {
        const width=Rect.width;
        const height=Rect.height;     
        
        // Auto determine tbNo and tbRow
        this._tbNo = this._determineMinColRow(width,height).minCol;
        this._tbRow = this._determineMinColRow(width,height).minRow;

       // console.log(this._tbNo);
       // console.log(this._tbRow);
        
        this._reponsiveThumbnailControl();       
    }

    _reponsiveThumbnailControl() {
        if (this._layout==="vertical") {
            this._thumbnailControl_container.style.cssText = `row-gap:${this._thumbnailGap} ; column-gap:${this._thumbnailGap}; flex-direction: column; flex-wrap: wrap; overflow-x: scroll; overflow-y: hidden; scroll-snap-type: x mandatory; height:100%;`;

            this._thumbnailControl_div.forEach(item=>{
                item.style.cssText = `width:calc((100% / ${this._tbNo}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbNo})); height:calc((100% / ${this._tbRow}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbRow}));     scroll-snap-align: center;`;
            });
        }

        if (this._layout==="horizontal") {
        this._thumbnailControl_container.style.cssText = `row-gap:${this._thumbnailGap} ; column-gap:${this._thumbnailGap}; flex-direction: row; flex-wrap: wrap; overflow-x: hidden; overflow-y: scroll; scroll-snap-type: y mandatory; height:100%;`;

        this._thumbnailControl_div.forEach(item=>{
            item.style.cssText = `width:calc((100% / ${this._tbNo}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbNo})); height:calc((100% / ${this._tbRow}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbRow}));     scroll-snap-align: center;`;
        });
        }
    }

    _handleResizeWholeComponent(Rect) {
        const width=Rect.width;
        const height=Rect.height;
   

        if (width < this._BREAKPOINTS.PHONE_VERTICAL) {   // Mobile   

            if (height>this._BREAKPOINTS.SHORT_SCREEN) {
                this._minTblength = 80;  
                this._layout="vertical";
                this._screen="mobile";
               // console.log("mobile");
                this._container.style.cssText = "flex-direction: column";
                this._main_viewer.style.cssText = "flex:6; height:0";
                this._extra_viewer.style.cssText = "flex:7; height:0";
                this._controlBar.style.cssText = "flex:1; height:0";
                this._info.style.cssText = "flex:4; height:0";
                // this._thumbnailControl_container.style.cssText = `row-gap:${this._thumbnailGap} ; column-gap:${this._thumbnailGap}; overflow-x:scroll; overflow-y:hidden; scroll-snap-type: x mandatory; `;

                // this._thumbnailControl_div.forEach(item=>{
                //     item.style.cssText = `width:calc((100% / ${this._tbNo}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbNo}));     scroll-snap-align: center;`;
                // })
            }           
            
        } else if (width < this._BREAKPOINTS.TABLET_VERTICAL) {
            // Tablet vertical
            this._layout="vertical";
            this._screen="tablet_vertical";
            this._minTblength = 130;
           // console.log("Tablet vertical");
            this._container.style.cssText = "flex-direction: column";
            this._main_viewer.style.cssText = "flex:6; height:0";
            this._extra_viewer.style.cssText = "flex:6; height:0";
            this._controlBar.style.cssText = "flex:2; height:0";
            this._info.style.cssText = "flex:4; height:0";
                             
            if (height<=this._BREAKPOINTS.SHORT_SCREEN) {
                this._screen="mobile_landscape";
               // console.log("mobile landscape");
                this._layout="horizontal";
                this._minTblength = 80;
                this._container.style.cssText = "flex-direction: row";
                this._main_viewer.style.cssText = "flex:8; width:0";
                this._extra_viewer.style.cssText = "flex:4; width:0";

            }
            
        } else if (width < this._BREAKPOINTS.TABLET_HORIZONTAL ) {          
            // Tablet horizontal
            this._screen="tablet_horizontal";
            this._layout="horizontal";
           // console.log("Tablet horizontal");
            this._minTblength = 130;
            this._container.style.cssText = "flex-direction: row; height:95%;";
            this._main_viewer.style.cssText = "flex:8; width:0";
            this._extra_viewer.style.cssText = "flex:6; width:0";
            this._controlBar.style.cssText = "flex:3; height:0";
            this._info.style.cssText = "flex:4; height:0";
          
        } else { 
           // console.log(this._imgContainer.clientWidth);     
            // Desktop
            this._screen="desktop";
          //  console.log("Desktop");
            this._layout="horizontal";

            this._minTblength = 130;
            this._container.style.cssText = "flex-direction: row; height:95%;";
            this._main_viewer.style.cssText = "flex:8; width:0";
            this._extra_viewer.style.cssText = "flex:6; width:0";
            this._controlBar.style.cssText = "flex:3; height:0";
            this._info.style.cssText = "flex:4; height:0";
        } 


        console.log(`width`,width);
        console.log(`height`,height);

        console.log(width/height);
        console.log(height/width);
        if (width/height>1.23) {
            console.log(width/height);
            this._layout="horizontal"; 
            console.log(`horizontal`);
        }
        if (height/width>1.23) {
            console.log(height/width);
            this._layout="vertical";
            console.log(`vertical`);
        }

    }

    render() {    
        this.shadowRoot.innerHTML = `${this.componentCSS}
        <div class="overlay">
            <div class="container">
                <div class="main_viewer noUserSelect">    
                    <div class="imgContainer noScrollBar"></div>  
                    <div class="leftBtn controlBtn"><span><</span></div> 
                    <div class="rightBtn controlBtn"><span>></span></div>    
                    <div class="optionBtn"><div></div><div></div><div></div><div></div></div>    
                    <div class="dotControl_container"></div>    
                </div>    
                <div class="extra_viewer noUserSelect">     
                    <div class="controlBar">
                        <div class="thumbnailControl_container noScrollBar"></div>                   
                    </div>   
                    <div class="info noScrollBar"></div> 
                </div>      
                <div class="closeBtn"></div>
            </div> 
        </div>`;
        this._overlay = this.shadowRoot.querySelector('.overlay'); 
        this._container = this.shadowRoot.querySelector('.container'); 
            this._main_viewer = this.shadowRoot.querySelector('.main_viewer');            
                this._imgContainer = this.shadowRoot.querySelector('.imgContainer');   
                this._leftBtn = this.shadowRoot.querySelector('.leftBtn');
                this._rightBtn = this.shadowRoot.querySelector('.rightBtn');
                this._optionBtn = this.shadowRoot.querySelector('.optionBtn');
                this._dotControl_container = this.shadowRoot.querySelector('.dotControl_container'); 
            this._extra_viewer = this.shadowRoot.querySelector('.extra_viewer');
                this._controlBar = this.shadowRoot.querySelector('.controlBar');        
                    this._thumbnailControl_container = this.shadowRoot.querySelector('.thumbnailControl_container');   
                    this._info = this.shadowRoot.querySelector('.info');      
            this._closeBtn = this.shadowRoot.querySelector('.closeBtn');      
  
        //info control  

      this._bindEvents();

      // Trap focus logic
      this._trapFocus();
  
      // Handle Android bug
      this._disableAllInputInsteadOfTheFocus();
    }
  
    show(data,lastFocusedElement=null) {
    // pass data and render element
    this._data={...data};

    this._pos = 0;

    this._effect = "Slide"; //slide fadeIn zoomin slideFade rotateYaxis slideBlur curtainReveal
    this._imgFitstyle = "cover";  

       // render Main Photos container
    this._renderCarouselFromArray();

    // render Dot Control 
    this._dotNo = 5;
    this._renderDotsControl();

    this._thumbnailGap = "1px";


    console.log(this._tbNo);
    console.log(this._tbRow);
    this._renderThumbnailControl();

    // Initial Jump to Pre-selected position
    setTimeout(()=>{
        this._albumShowPos(this._pos);
    },0);

    // render Info
    this._info.innerHTML=`<span class="firstCol">Phân loại</span><span>${this._data.category}</span>
    <span class="firstCol">Tên sản phẩm</span><span>${this._data.name}</span>
    <span class="firstCol">Mã hiệu</span><span>${this._data.id}</span>
    <span class="firstCol">Đơn giá</span><span>${this.addDotToNumber(this._data.price)}</span>
    <span class="firstCol">Đơn vị tính</span><span>${this._data.unit}</span>
    <span class="firstCol">Thành phần chính</span><span>${this._data.description}</span>
    <span class="firstCol">Số lượng đặt tối thiểu</span><span>${this._data.minOrder} ${this._data.unit}</span>
    `; 

    // final procedures to show,etc., focus handling, storaing last focus element
    // document.body.classList.add("dimmed"); // disable other components/elements of app
    if (lastFocusedElement===null) {this._previouslyFocusedElement = document.activeElement;      
    } else {
    this._previouslyFocusedElement = lastFocusedElement;
    }
    this.shadowRoot.querySelector(".container").focus();
}

_handleItemSelect(location) {
    return; // disable selection;
    // handle update property      
    const result = this._selectedItems.find(item=>item===location);
    console.log(result);
    if (result!=undefined) {
        console.log('vao found');
        this._selectedItems = this._selectedItems.filter(item=>item!==location); 
        this._imgContainer_div[location].querySelector('.tick').classList.add('hidden');
        this._thumbnailControl_div[location].querySelector('.tickThumbnail').classList.add('hidden');
       // console.log(this._img_container_main_div[location].querySelector('.tick'));
    } else {
        console.log('vao cannot be found');
        this._selectedItems.push(location);       
        this._imgContainer_div[location].querySelector('.tick').classList.remove('hidden'); 
        this._thumbnailControl_div[location].querySelector('.tickThumbnail').classList.remove('hidden'); 
       // console.log(this._img_container_main_div[location].querySelector('.tick'));
    }
    //console.log(this._selectedItems);
}

    _renderCarouselFromArray() {

        this._imgContainer.innerHTML="";  
        
        let imgArrayHtml ="";
        this._data.url.forEach((img,index)=>{   
            let tickString = "hidden";
            if (this._selectedItems.find(item=>item===index)!=undefined) {
                tickString="";     
            }
            imgArrayHtml = imgArrayHtml + `<div class="imgContainer_div"><div class="tick ${tickString}">✔</div><img loading="lazy" style="object-fit:${this._imgFitstyle}" src="${img}" alt="${index}"/></div>`;
        });

        this._imgContainer.innerHTML=imgArrayHtml;   

        this._imgContainer_div = Array.from(this._imgContainer.querySelectorAll('.imgContainer_div'));

        this._imgContainer_div.forEach((item,index)=>{
            item.addEventListener('dblclick',(e)=>{
                e.stopPropagation();
                this._handleItemSelect(this._pos);
            })

            // Hide from beginning until finish loading
           // if (index>0) item.style.display = "none";
        })        
   
        if (this._effect === "Slide") {
            this._imgContainer.classList.add('effect_slide_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_slide_item');
            }) 
        }

        if (this._effect === "FadeIn") {
            this._imgContainer.style.cssText = "transform: translateX(0%);";
            this._imgContainer.classList.add('effect_fadeIn_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_fadeIn_item');
               // element.style.cssText = `height: ${this._carouselHeight}`;
            }) 
        }

        if (this._effect === "ZoomIn") {
            this._imgContainer.style.cssText = "transform: translateX(0%);";
            this._imgContainer.classList.add('effect_zoomin_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_zoomin_item');
                //element.style.cssText = `height: ${this._carouselHeight}`;
            }) 
        }

        if (this._effect === "SlideFade") {
            this._imgContainer.classList.add('effect_slideFade_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_slideFade_item');
            }) 
        }

        if (this._effect === "RotateY") {
            this._imgContainer.style.cssText = "transform: translateX(0%);";

            this._imgContainer.classList.add('effect_rotateYaxis_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_rotateYaxis_item');
            }) 
        }

        if (this._effect === "SlideBlur") {
            this._imgContainer.classList.add('effect_slideBlur_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_slideBlur_item');              
            }) 
        }

        if (this._effect === "Curtain") {
            this._imgContainer.style.cssText = "transform: translateX(0%);";
            this._imgContainer.classList.add('effect_curtainReveal_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_curtainReveal_item');             
            }) 
        }       


        // hide carousel until all effects are done 
        // setTimeout(()=>{
        //     this._imgContainer_div.forEach((item,index)=>{               
        //         if (index>0) item.style.display = "block";
        //     })      
        // },500);
        
        
    }

    _renderDotsControl() {
        this._dotControl_container.innerHTML="";
        let htmlString = "";
        if (this._dotNo>this._data.url.length) this._dotNo = this._data.url.length;
        this._data.url.forEach((item,index)=>{
            htmlString = htmlString + `<div class="dot"></div>`;
        });
        this._dotControl_container.innerHTML = `<div class="dotControlFlex noScrollBar">${htmlString}</div>`;
        this._dotControlFlex = this._dotControl_container.querySelector('.dotControlFlex');
        this._dotControlFlex.style.cssText = `width:${this._dotNo*30}px`;        

        const dots =  Array.from(this._dotControlFlex.querySelectorAll('.dot'));
        dots.forEach((dot,index)=>{
            dot.addEventListener('click',()=>{
                // console.log(index);
                this._pos=index;
                this._albumShowPos(this._pos);
            })
        })


        //  this._dotControlFlex.addEventListener('scroll',()=>{
        //     console.log(this._fromScrollLeft2Mid(this._dotControlFlex.scrollLeft));
        //  })

    }

    _renderThumbnailControl() {
        this._thumbnailControl_container.innerHTML="";
        let imgArrayHtml = "";
        let activeClass = "";       
        this._data.url.forEach((img,index)=>{
            if (index===this._pos) {activeClass="active";} else {activeClass = "";}
            imgArrayHtml = imgArrayHtml + `<div class="thumbnailControl_div ${activeClass}"><div class="highlight"><div></div></div><div class="tickThumbnail hidden">✔</div><img loading="lazy" style="max-height:512px; max-width:512px;" alt="${index}" src="${img}"/></div>`;            
        });
        this._thumbnailControl_container.innerHTML=imgArrayHtml;      

        this._thumbnailControl_div=Array.from(this._thumbnailControl_container.querySelectorAll('.thumbnailControl_div'));

       // console.log(thumbnailControl_div);
        this._thumbnailControl_div.forEach((item,index)=>{
            let timer;
            item.addEventListener('click',(e)=>{
                //console.log(e);
                e.stopPropagation();
                if (e.detail === 1) {    
                    timer = setTimeout(() => {
                        this._pos=index;
                        this._albumShowPos(this._pos);                     
                    }, 100)            
                }     
                if (e.detail === 2) {  
                    clearTimeout(timer);                 
                    this._handleItemSelect(index);// it was a single click
                }   

            })

        })   
    }

    _albumShowPos(pos) {   
  
        if (this._effect==="Slide") { // slide fadeIn zoomin slideFade  Rotate (Y-Axis) slideBlur curtainReveal
            const offset = -100*pos;
            this._imgContainer.style.transform = `translateX(${offset}%)`;            
        } 

        if (this._effect==="FadeIn") {  // fadeIn 
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });     
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="ZoomIn") {   // 3. zoomin 
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="SlideFade") {   // 4. slideFade 
            const offset = -100*pos;
            this._imgContainer.style.transform = `translateX(${offset}%)`;  
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });        
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="RotateY") {   // 5. Rotate (Y-Axis)
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="SlideBlur") {   // 6. slideBlur
            const offset = -33.333333*pos;
            this._imgContainer.style.transform = `translateX(${offset}%)`;  
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="Curtain") {   // 7. curtainReveal
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        this._jumptoDotScroll(pos);
        this._jumptoThumbnailScrollPos(pos);  
        
        
        // handle controlBar
        // if (this._tbHeight&&this._tbHeight!="none") this._jumptoThumbnailScrollPos(pos);   
        // if (this._dotControl==="true") {
        //     //this._jumptoDot(pos);    
        //     this._jumptoDotScroll(pos);
        // }


    }    
    
    _jumptoDotScroll(pos) {
        //console.log(pos);
        let maxScrollLeft = this._dotControlFlex.scrollWidth - this._dotControlFlex.clientWidth;        
        const aStep = maxScrollLeft/(this._data.url.length-this._dotNo);
        const halfNo = (this._dotNo-1)/2;
        this._animateSelectedDot(pos);

        let currentScrollLeft = this._dotControlFlex.scrollLeft;
       //  console.log(currentScrollLeft);

        // renew dotMid with scroll to get new in range values
        if (this._dotMid!=this._fromScrollLeft2Mid(currentScrollLeft)) {
            this._dotMid=this._fromScrollLeft2Mid(currentScrollLeft);
        }
        //console.log( this._dotMid);

        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRangeDot(pos,this._dotMid)) {
           //console.log(`in range Dot`);
            this._dotControlFlex.scroll({
                left: aStep*(this._dotMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
        } else {     
           // console.log(`outrange Dot`);
            this._dotMid = pos+halfNo; 
           // console.log(this._direction);
            if (pos<halfNo) this._dotMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._dotMid = this._data.url.length-1 - halfNo; 
            //console.log(aStep*(this._dotMid-halfNo));
            //console.log(aStep);
              //  console.log(this._dotMid);
            //        console.log(halfNo);
            this._dotControlFlex.scroll({
                left: aStep*(this._dotMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
        }       
    }

    _animateSelectedDot(pos) {
        const dotsArray =  Array.from(this._dotControlFlex.querySelectorAll('.dot'));
        dotsArray.forEach(dot=>{
            dot.classList.remove('dotActive');
            dot.classList.remove('dotSecondActive');
        })

        if (dotsArray[pos-1]) dotsArray[pos-1].classList.add('dotSecondActive');  
        if (dotsArray[pos+1]) dotsArray[pos+1].classList.add('dotSecondActive');  
        dotsArray[pos].classList.add('dotActive');   
    }

    _fromScrollLeft2Mid(scrollLeftValue) {
        let maxScrollLeft = this._dotControlFlex.scrollWidth - this._dotControlFlex.clientWidth;
        let aStep = maxScrollLeft/(this._data.url.length-this._dotNo);
        if (this._data.url.length===this._dotNo) aStep = 0;
        const halfNo = (this._dotNo-1)/2;       
        return Math.round((scrollLeftValue/aStep) + halfNo);
    }

    _checkInRangeDot(pos,middlePoint) {
        if (Math.abs(pos-middlePoint)<=(this._dotNo-1)/2) return true;
        return false;
    }

    _jumptoThumbnailScrollPos(pos) {  
        //console.log(`highlight pos ${pos}`);
       // console.log(this._layout);
        this._updateThumbnailElement(pos);  // highlight selected thumbnail   
  
        if (this._layout==="horizontal") { //scroll if vertical layout
           // console.log(`horizontal`);
            let KichThuoc = this._thumbnailControl_div[0].getBoundingClientRect().height;         
    
           //console.log(`KichThuoc`,KichThuoc);
           //console.log(`pos`,pos);
            const Pos_Row = this._fromPos1DtoXY2D(this._pos).y-1;
          // console.log(`Pos_Row`,Pos_Row);
        
        const currentViewedRow = Math.round(this._thumbnailControl_container.scrollTop/KichThuoc);
       // console.log(currentViewedRow);  
        const halfNoRow = (this._tbRow-1)/2;
      //  console.log(`halfNoRow`,halfNoRow);

        this._tbMidRow = currentViewedRow + halfNoRow;
       // console.log(`_tbMidRow`,this._tbMidRow);          
        if (this._checkInRangeThumbnailRow(Pos_Row,this._tbMidRow)) {    
        //    console.log(`in View`);     
            this._thumbnailControl_container.scroll({
                left: 0,
                top: KichThuoc*(this._tbMidRow-halfNoRow)+this._tbMidRow,  // +this._tbMidRow to correct Scroll
                behavior: 'smooth'
            });       
        } else {
          //  console.log(`Out of View`);     
            this._thumbnailControl_container.scroll({
                left: 0,
                top: KichThuoc*Pos_Row, 
                behavior: 'smooth'
            });  
        }
           
    } 

    if (this._layout==="vertical") { //scroll if vertical layout
        // console.log(`vertical`);
         let KichThuoc = this._thumbnailControl_div[0].getBoundingClientRect().width;         
 
     //   console.log(`KichThuoc`,KichThuoc);
     //   console.log(`pos`,pos);
         const Pos_Col = this._fromPos1DtoXY2D_Vertical(this._pos).x-1;
      //  console.log(`Pos_Col`,Pos_Col);
     
     const currentViewedCol = Math.round(this._thumbnailControl_container.scrollLeft/KichThuoc);
    // console.log(currentViewedCol);  
     const halfNoCol = (this._tbNo-1)/2;
    // console.log(`halfNoCol`,halfNoCol);

     this._tbMidCol = currentViewedCol + halfNoCol;
     //console.log(`_tbMidCol`,this._tbMidCol);         
   // console.log(this._checkInRangeThumbnailCol(Pos_Col,this._tbMidCol));
     if (this._checkInRangeThumbnailCol(Pos_Col,this._tbMidCol)) {    
        //  console.log(`in View`);     
        //  console.log(KichThuoc);
        //  console.log(this._tbMidCol);
        //  console.log(halfNoCol);
        //  console.log(this._tbMidCol);

         this._thumbnailControl_container.scroll({
             left: KichThuoc*(this._tbMidCol-halfNoCol)+this._tbMidCol,   // + Mid to correct Scroll
             top: 0, 
             behavior: 'smooth'
         });       
     } else {
         //console.log(`Out of View`);     
         this._thumbnailControl_container.scroll({
             left: KichThuoc*Pos_Col,
             top: 0, 
             behavior: 'smooth'
         });  
     }
        
    } 
    
    }

    _updateThumbnailElement(pos) {
        // highlight one, remove highlight rest
        this._thumbnailControl_container.querySelectorAll('.thumbnailControl_div').forEach(element=>{
            element.classList.remove('active');
            element.firstChild.classList.add('hidden');
        })
        this._thumbnailControl_container.querySelectorAll('.thumbnailControl_div')[pos].classList.add('active');
        this._thumbnailControl_container.querySelectorAll('.thumbnailControl_div')[pos].firstChild.classList.remove('hidden');        
        return this._thumbnailControl_container.querySelectorAll('.thumbnailControl_div')[pos];        
    }

    _fromScrollLeft2MidThumbnail(scrollLeftValue) {
        let maxScrollLeft = this._thumbnailControl_container.scrollWidth - this._thumbnailControl_container.clientWidth;
        let aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        if (this._data.url.length===this._tbNo) aStep = 0;
        const halfNo = (this._tbNo-1)/2;      
        return Math.round((scrollLeftValue/aStep) + halfNo);
    }

    _checkInRangeThumbnailRow(row,midRow) {
        if (Math.abs(row-midRow)<=(this._tbRow-1)/2) return true;
        return false;
    }

    _checkInRangeThumbnailCol(col,midCol) {
        if (Math.abs(col-midCol)<=(this._tbNo-1)/2) return true;
        return false;
    }

    _Up() {
    // console.log("up");        
        let Coordinate;
        if (this._layout==="horizontal") {
            Coordinate = this._fromPos1DtoXY2D(this._pos);
        let CoorX = Coordinate.x;
        let CoorY = Coordinate.y;
        if (CoorY>1) {
            CoorY--;
            this._direction=-1;     
            this._pos = this._fromXY2DtoPos1D(CoorX,CoorY);  
            this._albumShowPos(this._pos);  
            } 
        }
        if (this._layout==="vertical") {
           this._prev();
        }
    }

    _Right() {
        const Coordinate = this._fromPos1DtoXY2D_Vertical(this._pos);
        let CoorX = Coordinate.x;
        let CoorY = Coordinate.y;
        let MaxLength = this._data.url.length;
        let MaxCoorY;
        if (MaxLength % this._tbRow!==0) MaxCoorY = MaxLength % this._tbRow; else {
            MaxCoorY = this._tbRow;
        }    
        let MaxCol =  1+(MaxLength-MaxCoorY)/this._tbRow;        
        if (CoorX<MaxCol) {                      
            CoorX++;    
            if (CoorX===MaxCol&&CoorY>MaxCoorY) CoorY=MaxCoorY; // dealing with bottom edge 
            this._direction=+1;
            this._pos = this._fromXY2DtoPos1D_Vertical(CoorX,CoorY);            
            this._albumShowPos(this._pos);     
        }
    }

    _Left() {
        let Coordinate;
            Coordinate = this._fromPos1DtoXY2D_Vertical(this._pos);
            console.log(Coordinate);
        let CoorX = Coordinate.x;
        let CoorY = Coordinate.y;
        if (CoorX>1) {
            CoorX--;
            this._direction=-1; 
            this._pos = this._fromXY2DtoPos1D_Vertical(CoorX,CoorY);             
            this._albumShowPos(this._pos);  
        }      
    }
        
    _Down() {        
        const Coordinate = this._fromPos1DtoXY2D(this._pos);
        let CoorX = Coordinate.x;
        let CoorY = Coordinate.y;
        let MaxLength = this._data.url.length;
        let MaxCoorX;
        if (MaxLength % this._tbNo!==0) MaxCoorX = MaxLength % this._tbNo; else {
            MaxCoorX = this._tbNo;
        }    
        let MaxRow =  1+(MaxLength-MaxCoorX)/this._tbNo;        
        if (CoorY<MaxRow) {                      
            CoorY++;    
            if (CoorY===MaxRow&&CoorX>MaxCoorX) CoorX=MaxCoorX; // dealing with bottom edge 
            this._direction=+1;
            this._pos = this._fromXY2DtoPos1D(CoorX,CoorY);            
            this._albumShowPos(this._pos);     
        }
    }
 
    _fromPos1DtoXY2D(pos) {
        const ConvertedPos = pos + 1;
        let CoorX;
        let CoorY;
        if (ConvertedPos % this._tbNo!==0) CoorX = ConvertedPos % this._tbNo; else {
            CoorX = this._tbNo;
        }        
        CoorY = 1+(ConvertedPos-CoorX)/this._tbNo;
        return {
            x: CoorX,
            y: CoorY
        }
    }
 
    _fromXY2DtoPos1D(CoorX,CoorY) {
        return (CoorY-1)*this._tbNo+CoorX-1;
    }

    _fromPos1DtoXY2D_Vertical(pos) {
        const ConvertedPos = pos + 1;
        let CoorX;
        let CoorY;
       // console.log(this._tbRow);
        if (ConvertedPos % this._tbRow!==0) CoorY = ConvertedPos % this._tbRow; else {
            CoorY = this._tbRow;
        }        
        CoorX = 1+(ConvertedPos-CoorY)/this._tbRow;
        return {
            x: CoorX,
            y: CoorY
        }
    }
 
    _fromXY2DtoPos1D_Vertical(CoorX,CoorY) {
        return (CoorX-1)*this._tbRow+CoorY-1;
    }

    _setCssforLayout() {
        if (this._layout==="horizontal")
        {
            this._container.style.cssText  = this._container.style.cssText + "flex-direction: row;";
            this._thumbnailControl_container.style.cssText = this._thumbnailControl_container.style.cssText + "height: 100%; max-height: 100%; flex-wrap:wrap; overflow-y: scroll;";
            // this._thumbnailControl_div.forEach(element=>{
            //     console.log(`height: calc((${this._controlBar.clientHeight}px / ${this._tbRow}) - ${this._thumbnailGap});`);
            //     element.style.cssText = element.style.cssText + `height: calc((${this._controlBar.clientHeight}px / ${this._tbRow}) - ${this._thumbnailGap});`;
            // })
        }
    }
    
    _prev() {
        if (this._pos>0) {         
            this._pos--;  
            this._direction=-1;
            this._albumShowPos(this._pos);  
        }
    }

    _next() {
        if (this._pos<this._data.url.length-1) {       
            this._pos++;   
            this._direction=1;
            this._albumShowPos(this._pos);
        }
    }

    _onSwipeStart(event) {
        // console.log(event);
         event.preventDefault();
         event.stopPropagation();
         this._swipeStart = event.touches[0].clientX;
    }
     
    _onSwipeEnd(event) {
         console.log(`_onSwipeEnd`);
     const end = event.changedTouches[0].clientX;
    // this._info.innerHTML=this._swipeStart - end;
     if (this._swipeStart===end) this._handleItemSelect(this._pos);
     if (this._swipeStart - end > 50) this._next();
         if (this._swipeStart - end > 170) this._next();
     if (end - this._swipeStart > 50) this._prev();
         if (end - this._swipeStart > 170) this._prev();
    }
 
    _onKeyDown(event) {
        // for 2 layout, buttons act differently
        if (event.key === "ArrowLeft") {
            if (this._layout==="horizontal")
            this._prev();
            if (this._layout==="vertical")
            this._Left();
        }

        if (event.key === "ArrowRight") {
            if (this._layout==="horizontal")
                this._next();
                if (this._layout==="vertical")
                this._Right();
          

        }
        if (event.key === "ArrowUp") this._Up();

        if (event.key === "ArrowDown") {  
            if (this._layout==="horizontal")
            this._Down();
            if (this._layout==="vertical")
            this._next();    
        }
    }

    _renderOptionDialog() {
        const aDiv=document.createElement('div');
        aDiv.innerHTML=`<option-dialog></option-dialog>`;
        this.shadowRoot.appendChild(aDiv);
        this._dialog = this.shadowRoot.querySelector('option-dialog');
        const dialog_header = `<h2>Photo Viewer Options</h2>`;
        //Slide FadeIn Zoomin SlideFade  Rotate (Y-Axis) SlideBlur CurtainReveal
        const dialog_body = `
   <div class="scrollableY noScrollBar noUserSelect" data-theme="dark">
                 <legend>Transition effect:</legend>
    <div class="two_columns input_button">
        <label><input type="radio" value="Slide" name="effect" />
            Slide</label>
        <label><input type="radio" value="FadeIn" name="effect" />
            FadeIn</label>
        <label><input type="radio" value="ZoomIn" name="effect" />
            ZoomIn</label>
        <label><input type="radio" value="SlideFade" name="effect" />
            SlideFade</label>
        <label><input type="radio" value="SlideBlur" name="effect" />
            SlideBlur</label>
        <label><input type="radio" value="Curtain" name="effect" />
            Curtain</label>
    </div>

    <legend>Photo fitting style:</legend>
    <div class="two_columns input_button">
        <label><input type="radio" value="contain" name="fitstyle" />
            Contain</label>
        <label><input type="radio" value="cover" name="fitstyle" />
            Cover</label>       
    </div>

    <legend>Thumnail control</legend>

    <div class="sl-theme-dark">
        <sl-range name="row" data-custom-component style="
  --track-color-active: var(--sl-color-primary-600);
  --track-color-inactive: var(--sl-color-primary-100);
" label="Row" min="1" max="10" step="1"></></sl-range>
 <legend></legend>    
<sl-range name="col" data-custom-component style="
  --track-color-active: var(--sl-color-primary-600);
  --track-color-inactive: var(--sl-color-primary-100);
" label="Column" min="1" max="10" step="1"></></sl-range>
    </div></div>
`;
        console.log(this._imgFitstyle);
        const initialObj = {
            effect: this._effect,
            fitstyle: this._imgFitstyle,
            row:this._tbRow,
            col:this._tbNo
        }
        this._dialog.open(dialog_header,dialog_body);
        this._dialog.setValues(initialObj);
        this._dialog.addEventListener("confirm", this._handleViewerOptionChange.bind(this));
        this._dialog.addEventListener("cancel", ()=>{
            this._dialog.parentElement.remove();
        });
    }

    _handleViewerOptionChange(e) {    
        const data=e.detail;
       // console.log(data.effect);
       // console.log(data.fitstyle);
        this._effect = data.effect;
        this._imgFitstyle = data.fitstyle;
        this._tbRow=data.row;
        this._tbNo=data.col;
        this._renderCarouselFromArray();
        this._reponsiveThumbnailControl();
      
        // this._tempSelectedItems = [...this._selectedItems];
        // this._selectedItems = [];
        console.log(this._selectedItems);
        // console.log(this._tempSelectedItems);
        // this._tempSelectedItems.forEach(item=>this._handleItemSelect(item));
        // this._imgContainer_div.forEach(item=>{
        //    // console.log(item.children[1]);
        //     item.children[1].style.cssText = `object-fit:${this._imgFitstyle};`
        // });     

        setTimeout(()=>{
            this._albumShowPos(this._pos);
        },0);     
        this._dialog.parentElement.remove();
    }

    _handleOverlayClick(e) {
        console.log(e.target);
        e.stopPropagation();
        if (e.target===this._overlay) {
            console.log(e.target);
            this._handleEventCreation("remove","remove");
        } 
    }

    _bindEvents() {
        this._overlay.addEventListener('click',this._handleOverlayClick.bind(this));
        this._leftBtn.addEventListener('click',this._prev.bind(this));        
        this._rightBtn.addEventListener('click',this._next.bind(this));   
        this._optionBtn.addEventListener('click',this._renderOptionDialog.bind(this)); 
       // this._closeBtn.addEventListener('click', ()=> { this._hideOverlay(); });   
        
        // Swipe support
        this._swipeStart = null;
        this._imgContainer.addEventListener("touchstart", this._onSwipeStart.bind(this));
        this._imgContainer.addEventListener("touchend", this._onSwipeEnd.bind(this));
    
        // Keyboard navigation
        window.addEventListener("keydown", this._onKeyDown.bind(this));
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

    _handleEventCreation(data,eventName) {
        const event = new CustomEvent(eventName, {
            detail: { data
            },
            bubbles: true, // Allow bubbling to the document 
            composed: true // Allow crossing Shadow DOM boundaries 
            });
        this.dispatchEvent(event);     
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
  
  customElements.define("photo-viewer", PhotoViewer);
  
 