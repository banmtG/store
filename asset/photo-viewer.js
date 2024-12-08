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


    }

    connectedCallback() {
        this.render();    
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                console.log(entry.contentRect);
                this._handleResize(entry.contentRect);
            }
        });    
        this.resizeObserver.observe(this);
    }

    disconnectedCallback() {
        this.resizeObserver.disconnect();
    }

    _handleResize(Rect) {
        const width=Rect.width;
        if (width < this._BREAKPOINTS.PHONE_VERTICAL) {   // Mobile   
            console.log("mobile");
            this._main_viewer.style.cssText = "flex:8;";
            this._extra_viewer.style.cssText = "flex:2;";
            
        } else if (width < this._BREAKPOINTS.TABLET_VERTICAL) {
            // Tablet vertical
            console.log("Tablet vertical");
            this._main_viewer.style.cssText = "flex:9;";
            this._extra_viewer.style.cssText = "flex:4;";
            
        } else if (width < this._BREAKPOINTS.TABLET_HORIZONTAL ) {          
            // Tablet horizontal
            console.log("Tablet horizontal");
            this._main_viewer.style.cssText = "flex:8;";
            this._extra_viewer.style.cssText = "flex:3;";
        } else { 
            console.log(this._imgContainer.clientWidth);     
            // Desktop
            console.log("Desktop");
            this._main_viewer.style.cssText = "flex:8;";
            this._extra_viewer.style.cssText = "flex:4;";

        }
    }

    render() {    
        this.shadowRoot.innerHTML = `${this.componentCSS}
            <div class="container">
                <div class="main_viewer noUserSelect">    
                    <div class="imgContainer noScrollBar"></div>  
                    <div class="leftBtn controlBtn"><span><</span></div> 
                    <div class="rightBtn controlBtn"><span>></span></div>    
                    <div class="dotControl_container"></div>    
                </div>    
                <div class="extra_viewer noUserSelect">     
                    <div class="controlBar">
                        <div class="thumbnailControl_container noScrollBar"></div>                   
                    </div>   
                    <div class="info noScrollBar"></div> 
                </div>      
                <div class="closeBtn">X</div>
            </div>`;
        this._container = this.shadowRoot.querySelector('.container'); 
            this._main_viewer = this.shadowRoot.querySelector('.main_viewer');            
                this._imgContainer = this.shadowRoot.querySelector('.imgContainer');   
                this._leftBtn = this.shadowRoot.querySelector('.leftBtn');
                this._rightBtn = this.shadowRoot.querySelector('.rightBtn');
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
  
showOverlay(data,lastFocusedElement=null) {
    // pass data and render element
    this._data={...data};

    this._pos = 0;

    this._effect = "fadeIn"; //slide fadeIn zoomin slideFade rotateYaxis slideBlur curtainReveal

    // render Main Photos container
    this._renderCarouselFromArray();

    // render Dot Control 
    this._dotNo = 5;
    this._renderDotsControl();

    // render Thumbnail Control 
    this._tbNo = 4; // column Number
    this._tbRow = 6; // row Number
    this._thumbnailGap = "1px";
    //console.log( document.body.clientWidth);
    //this._layout = "vertical"; 
    if (document.body.clientWidth>=768) {
        this._tbNo = 4; // column Number
        this._layout = "horizontal"; // vertical horizontal
    }
    // this._layout = "horizontal"; // vertical horizontal



    this._renderThumbnailControl();
    this._setCssforLayout();


    // Initial Jump to Pre-selected position
    setTimeout(()=>{
        this._albumShowPos(this._pos);
    },10);

    // render Info
    this._info.innerHTML=JSON.stringify(this._data);

    // final procedures to show,etc., focus handling, storaing last focus element
    // document.body.classList.add("dimmed"); // disable other components/elements of app
    if (lastFocusedElement===null) {this._previouslyFocusedElement = document.activeElement;      
    } else {
    this._previouslyFocusedElement = lastFocusedElement;
    }
    this.shadowRoot.querySelector(".container").focus();
}

    _renderCarouselFromArray() {
        this._imgContainer.innerHTML="";  
        
        let imgArrayHtml ="";
        this._data.url.forEach((img,index)=>{
            imgArrayHtml = imgArrayHtml + `<div class="imgContainer_div"><div class="tick hidden">✔</div><img loading="lazy" src="${img}" alt="${index}"/></div>`;
        });

        this._imgContainer.innerHTML=imgArrayHtml;   

        this._imgContainer_div = Array.from(this._imgContainer.querySelectorAll('.imgContainer_div'));

        this._imgContainer_div.forEach((item,index)=>{
            item.addEventListener('dblclick',(e)=>{
                e.stopPropagation();
                this._handleItemSelect(this._pos);
            })
            if (index>0) item.style.display = "none";
        })        

        
        if (this._effect === "slide") {
            this._imgContainer.classList.add('effect_slide_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_slide_item');
            }) 
        }

        if (this._effect === "fadeIn") {
            this._imgContainer.classList.add('effect_fadeIn_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_fadeIn_item');
               // element.style.cssText = `height: ${this._carouselHeight}`;
            }) 
        }

        if (this._effect === "zoomin") {
            this._imgContainer.classList.add('effect_zoomin_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_zoomin_item');
                //element.style.cssText = `height: ${this._carouselHeight}`;
            }) 
        }

        if (this._effect === "slideFade") {
            this._imgContainer.classList.add('effect_slideFade_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_slideFade_item');
            }) 
        }

        if (this._effect === "rotateYaxis") {
            this._imgContainer.classList.add('effect_rotateYaxis_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_rotateYaxis_item');
            }) 
        }

        if (this._effect === "slideBlur") {
            this._imgContainer.classList.add('effect_slideBlur_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_slideBlur_item');              
            }) 
        }

        if (this._effect === "curtainReveal") {
            this._imgContainer.classList.add('effect_curtainReveal_container');
            this._imgContainer_div.forEach(element=>{
                element.classList.add('effect_curtainReveal_item');             
            }) 
        }       

        setTimeout(()=>{
            this._imgContainer_div.forEach((item,index)=>{               
                if (index>0) item.style.display = "block";
            })      
        },500);
        
        
    }

    _renderDotsControl() {
        this._dotControl_container.innerHTML="";
        let htmlString = "";
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
    }

    _renderThumbnailControl() {
        this._thumbnailControl_container.innerHTML="";
        this._thumbnailControl_container.style.cssText  = `row-gap:${this._thumbnailGap} ; column-gap:${this._thumbnailGap}`;

        // this._thumbnailControl_container.addEventListener('scroll',()=>{
        //     this._info.innerHTML=`this._thumbnailControl_container.scrollTop = ${this._thumbnailControl_container.scrollTop} this._thumbnailControl_container.scrollHeight = ${this._thumbnailControl_container.scrollHeight} this._thumbnailControl_container.clientHeight = ${this._thumbnailControl_container.clientHeight} Substract = ${this._thumbnailControl_container.scrollHeight-this._thumbnailControl_container.clientHeight}`;
        // })

        let imgArrayHtml = "";
        let activeClass = "";           
        if (this._layout==="vertical"&&this._tbNo<3) this._tbNo = 3;
        //let widthPercentage =100/this._tbNo;

        let widthString = `calc((100% / ${this._tbNo}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbNo}))`;
       // let heightPercentage =100/this._tbRow;

        let heightString = "";
       // console.log(this._tbRow, this._thumbnailGap, this._layout);
        // setTimeout(() => {
        //             console.log(this._controlBar.offsetHeight/3);
        // }, 300);

         //console.log(this._controlBar.offsetHeight/3);


        if (this._layout==="horizontal"&&this._tbRow&&this._thumbnailGap)
        heightString = `calc((100% / ${this._tbRow}) - ${this._thumbnailGap} + (${this._thumbnailGap} / ${this._tbRow}))`;

        //console.log(heightString);

        this._data.url.forEach((img,index)=>{
            if (index===this._pos) {activeClass="active";} else {activeClass = "";}
            imgArrayHtml = imgArrayHtml + `<div class="thumbnailControl_div ${activeClass}" style="width:${widthString}; height:${heightString}"><div class="highlight">―</div><div class="tickThumbnail hidden">✔</div><img loading="lazy" style="max-height:512px; max-width:512px;" alt="${index}" src="${img}"/></div>`;            
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
                    }, 200)            
                }     
                if (e.detail === 2) {  
                    clearTimeout(timer);                 
                    this._handleItemSelect(index);// it was a single click
                }   

            })

        })   

        setTimeout(()=>{
        
        },1000)
      
       
    }

    _albumShowPos(pos) {   

        if (this._effect==="slide") { // slide 
            const offset = -100*pos;
            this._imgContainer.style.transform = `translateX(${offset}%)`;            
        } 

        if (this._effect==="fadeIn") {  // fadeIn 
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });     
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="zoomin") {   // 3. zoomin 
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="slideFade") {   // 4. slideFade 
            const offset = -100*pos;
            this._imgContainer.style.transform = `translateX(${offset}%)`;  
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });        
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="rotateYaxis") {   // 5. Rotate (Y-Axis)
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="slideBlur") {   // 6. slideBlur
            const offset = -33.333333*pos;
            this._imgContainer.style.transform = `translateX(${offset}%)`;  
            this._imgContainer_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._imgContainer_div[pos].classList.add('active');
        }

        if (this._effect==="curtainReveal") {   // 7. curtainReveal
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
        let maxScrollLeft = this._dotControlFlex.scrollWidth - this._dotControlFlex.clientWidth;        
        const aStep = maxScrollLeft/(this._data.url.length-this._dotNo);
        const halfNo = (this._dotNo-1)/2;
        this._animateSelectedDot(pos);
        let currentScrollLeft = this._dotControlFlex.scrollLeft;

        // renew dotMid with scroll to get new in range values
        if (this._dotMid!=this._fromScrollLeft2Mid(currentScrollLeft)) {
            this._dotMid=this._fromScrollLeft2Mid(currentScrollLeft);
        }
        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRangeDot(pos,this._dotMid)) {

            this._dotControlFlex.scroll({
                left: aStep*(this._dotMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
        } else {     
            console.log(`outrange`);
            this._dotMid = pos+this._direction*halfNo; 
            if (pos<halfNo) this._dotMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._dotMid = this._data.url.length-1 - halfNo; 
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
        this._updateThumbnailElement(pos);  // highlight selected thumbnail

        if (this._layout==="horizontal") { //scroll if vertical layout
            let KichThuoc = this._thumbnailControl_div[0].getBoundingClientRect().height;
          //  console.log(`KichThuoc 1`,KichThuoc);
           // KichThuoc = 114 ;
            // console.log(`this._thumbnailControl_container.offsetHeight`,this._thumbnailControl_container.offsetHeight);
            // console.log(` this._tbRow`, this._tbRow);
            // console.log(`this._thumbnailGap`,this._thumbnailGap);

            // let calculatedKichThuoc = (this._thumbnailControl_container.clientHeight / this._tbRow) - 1 + (1 / this._tbRow);

            // console.log(`calculatedKichThuoc`,calculatedKichThuoc);
       
            console.log(`KichThuoc`,KichThuoc);
            // console.log(`pos`,pos);
            const Pos_Row = this._fromPos1DtoXY2D(this._pos).y-1;
            // console.log(`Pos_Row`,Pos_Row);
            const currentViewedRow = Math.round(this._thumbnailControl_container.scrollTop/KichThuoc);
            // console.log(currentViewedRow);  
            const halfNoRow = (this._tbRow-1)/2;
            // console.log(`halfNoRow`,halfNoRow);
            this._tbMidRow = currentViewedRow + halfNoRow;

            // console.log(`this._tbMidRow`,this._tbMidRow);
            // console.log(this._checkInRangeThumbnailRow(Pos_Row,this._tbMidRow));
            // let correctedScrollTop = KichThuoc*Pos_Row - 20;
            // console.log(correctedScrollTop);
            // console.log(`_tbMidRow`,this._tbMidRow);
            // console.log(`halfNoRow`,halfNoRow);

            // console.log(KichThuoc*(this._tbMidRow-halfNoRow));
                      
            if (this._checkInRangeThumbnailRow(Pos_Row,this._tbMidRow)) {    
                console.log(`in View`);     
                //this._thumbnailControl_container.scrollTop = KichThuoc*(this._tbMidRow-halfNoRow)+this._tbMidRow;
                this._thumbnailControl_container.scroll({
                    left: 0,
                    top: KichThuoc*(this._tbMidRow-halfNoRow)+this._tbMidRow,  // +this._tbMidRow to correct Scroll
                    behavior: 'smooth'
                });       
            } else {
                console.log(`Out of View`);     
                this._thumbnailControl_container.scroll({
                    left: 0,
                    top: KichThuoc*Pos_Row, 
                    behavior: 'smooth'
                });  
            }
           // 
            // console.log(`scrollTop`,this._thumbnailControl_container.scrollTop);
            // console.log(`scrollTop/KichThuoc`,this._thumbnailControl_container.scrollTop/KichThuoc);

    }


 
    if (this._layout!=="horizontal") { //scroll if vertical layout
        
        //console.log(`pos`,pos);
        let maxScrollLeft = this._thumbnailControl_container.scrollWidth - this._thumbnailControl_container.clientWidth;
        const aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        const halfNo = (this._tbNo-1)/2;
        let currentScrollLeft = this._thumbnailControl_container.scrollLeft;

        if (this._tbMid!=this._fromScrollLeft2MidThumbnail(currentScrollLeft)) this._tbMid=this._fromScrollLeft2MidThumbnail(currentScrollLeft);

        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRangeDot(pos,this._tbMid)) {
            console.log(`inrange`);
            this._thumbnailControl_container.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //console.log(this._thumbnailControl_container.scrollLeft);
        } else {           
            this._tbMid = pos+this._direction*halfNo; 
        
            if (pos<halfNo) this._tbMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._tbMid = this._data.url.length-1 - halfNo; 
            this._thumbnailControl_container.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //this._dotsContainer.scrollLeft = aStep*(this._tbMid-halfNo);
            //console.log( this._thumbnailControl_container.scrollLeft);
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

    _Up() {
    // console.log("up");
        const Coordinate = this._fromPos1DtoXY2D(this._pos);
        let CoorX = Coordinate.x;
        let CoorY = Coordinate.y;
        if (CoorY>1) {
            CoorY--;
            this._direction=-1;
            this._pos = this._fromXY2DtoPos1D(CoorX,CoorY);             
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
     this._info.innerHTML=this._swipeStart - end;
     if (this._swipeStart===end) this._handleItemSelect(this._pos);
     if (this._swipeStart - end > 50) this._next();
         if (this._swipeStart - end > 170) this._next();
     if (end - this._swipeStart > 50) this._prev();
         if (end - this._swipeStart > 170) this._prev();
    }
 
    _onKeyDown(event) {
        if (event.key === "ArrowLeft") this._prev();
        if (event.key === "ArrowRight") this._next();
        if (event.key === "ArrowUp") this._Up();
        if (event.key === "ArrowDown") this._Down();
    }

    _bindEvents() {
        this._leftBtn.addEventListener('click',this._prev.bind(this));        
        this._rightBtn.addEventListener('click',this._next.bind(this));   
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

}
  
  customElements.define("photo-viewer", PhotoViewer);
  
 