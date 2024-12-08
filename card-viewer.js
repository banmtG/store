class CustomOverlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.componentCSS = `<link rel="stylesheet" href="./card-viewer.css" /><link rel="stylesheet" href="./transient-effects.css" />`;
        
        this._tbNo = 7; // No of thumbNail in a row
        this._tbRow = 6; // item of row
        this._carouselHeight = "100%"; 
        this._tbHeight = "100px";  // 60px "__px" for thumbnail, "none" for disable thumbnail control
        this._dotControl = "true"; // true or false
        this._cardHeight = "90vh";  // 
        this._cardPosition = "center"; // "center" for middle of screen / "__px" for distance from top
        this._infoDisplay = "none";
        this._SelectedItem = [];
        this._effect="fadeIn"; //slide fadeIn zoomin slideFade rotateYaxis slideBlur curtainReveal
        this._layout="vertical"; // horizontal or vertical
        this._thumbnailGap = "2px";
        this._bindEvent=0;
         console.log(this._fromPos1DtoXY2D(11));
         console.log(this._fromXY2DtoPos1D(2,6));       
    }

    _Up() {
       // console.log("up");
        const Coordinate = this._fromPos1DtoXY2D(this._pos);
        let CoorX = Coordinate.x;
        let CoorY = Coordinate.y;
        console.log(`CoorX`,CoorX);
        console.log(`CoorY`,CoorY);
        if (CoorY>1) {
            CoorY--;
            this._direction=-1;
            this._pos = this._fromXY2DtoPos1D(CoorX,CoorY);
            console.log(this._fromXY2DtoPos1D(CoorX,CoorY));
            this._albumShowPos(this._pos);  
        }
    }

    _Down() {
         // console.log("up");
         const Coordinate = this._fromPos1DtoXY2D(this._pos);
         let CoorX = Coordinate.x;
         let CoorY = Coordinate.y;
        let MaxLength = this._data.url.length;
        let MaxCoorX;
         if (MaxLength % this._tbNo!==0) MaxCoorX = MaxLength % this._tbNo; else {
            MaxCoorX = this._tbNo;
        }           
       // console.log(MaxCoorX);
        
        let MaxRow =  1+(MaxLength-MaxCoorX)/this._tbNo;  
      //  console.log(MaxRow);
       //  console.log(`CoorX`,CoorX);
       //  console.log(`CoorY`,CoorY);
       
         if (CoorY<MaxRow) {                      
             CoorY++;
           //  console.log(CoorY);
            if (CoorY===MaxRow&&CoorX>MaxCoorX) CoorY--;

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
    
    connectedCallback() {
        this.render();        
    }

    _setCssforLayout() {
        if (this._layout==="horizontal")
        {
            this._container.style.cssText  = this._container.style.cssText + "flex-direction: row;";
            this._controlBar.style.cssText = this._controlBar.style.cssText + "height: 100%;";
            this._thumbnailControl_container.style.cssText = this._thumbnailControl_container.style.cssText + "height: 100%;";
            this._thumbnailControl.style.cssText = this._thumbnailControl.style.cssText + "height: auto; max-height: 100%; flex-wrap:wrap; overflow-y: scroll;";
            this._thumbnailControl_div.forEach(element=>{
                element.style.cssText = element.style.cssText + `height: calc((${this._cardHeight} / ${this._tbRow}) - ${this._thumbnailGap});`;
            })
        }
    }


    render() {    
        this.shadowRoot.innerHTML = `${this.componentCSS}
        <div class="overlay">
            <div tabindex="0" class="container" role="dialog" aria-modal="true">
                <div class="card_flexbox">    
                    <div class="imgContainer"></div>  
                    <div class="leftBtn controlBtn"><span><</span></div> 
                    <div class="rightBtn controlBtn"><span>></span></div>    
                    <div class="dot_controlBar_container"></div>    
                </div>        
                <div class="controlBar">
                    <div class="thumbnailControl_container"></div>
                </div>   
                <div class="info"></div>             
                <div class="closeBtn">X</div>
            </div>            
        </div>
      `;

      this._overlay = this.shadowRoot.querySelector('.overlay');      
      if (this._cardPosition==="center") 
        this._overlay.style.cssText  = `align-items:center`; 
      else {
        this._overlay.style.cssText  = `padding-top:${this._cardPosition}; align-items:start`; 
      }

      this._controlBar = this.shadowRoot.querySelector('.controlBar'); 

      this._dot_controlBar_container = this.shadowRoot.querySelector('.dot_controlBar_container'); 


      //info control
      this._info = this.shadowRoot.querySelector('.info');  
      if (this._infoDisplay==="none") this._info.style.display = `${this._infoDisplay}`;
      if (this._infoDisplay!=="none") this._info.style.cssText = `min-height: ${this._infoDisplay}`;
      // Close button logic
      //this.shadowRoot.querySelector("#close-overlay").addEventListener("click", () => this._hideOverlay());
  
      // Trap focus logic
      this._trapFocus();
  
      // Handle keyboard interactions (e.g., Escape key)
      this._handleKeyInteractions();

      // Handle Android bug
      this._disableAllInputInsteadOfTheFocus();

      // handle overlay click
      this._handleOverlayClick();
    }
  
    showOverlay(data,lastFocusedElement=null) {
      // pass data and render element
      this._data={...data};
      if (this._data.url.length<this._tbNo) this._tbNo = this._data.url.length;
      this._tbMid = (this._tbNo-1)/2;

      this._pos = 0;

      this.hidden = false;     

      this._container = this.shadowRoot.querySelector('.container');
      this._container.style.cssText  = `height:${this._cardHeight}`;

      this._imgContainer = this.shadowRoot.querySelector('.imgContainer');
      this._imgContainer.style.cssText = `height:${this._carouselHeight}`;

      this._leftBtn = this.shadowRoot.querySelector('.leftBtn');
      //console.log(this._leftBtn.style.cssText);
      this._leftBtn.style.cssText  = `height:${this._carouselHeight}`;
      this._rightBtn = this.shadowRoot.querySelector('.rightBtn');
      this._rightBtn.style.cssText  = `height:${this._carouselHeight}`;
      this._closeBtn = this.shadowRoot.querySelector('.closeBtn');
      //this._carouselHeight = "80%";
     
     

      this._renderCarouselFromArray();

  

      this._thumbnailControl_container = this.shadowRoot.querySelector('.thumbnailControl_container');
      //if (this._tbHeight==="none") {this._thumbnailControl_container.style.display = "none";}

      if (this._dotControl==="true") {
        this._dot_controlBar_container.style.cssText= `position:absolute; top:calc(${this._carouselHeight} - 30px);   border:none;`
       
        this._renderDotsControl();
      }

      if (this._tbHeight&&this._tbHeight!="none")
      this._renderThumbnailControl();

      this._setCssforLayout();

      // delay the scroll until items fully load or else scrollWidth not updataed
      setTimeout(()=>{
        this._albumShowPos(this._pos);
      },10);
      
      if (this._bindEvent===0) {
        this._bindEvents();
        this._bindEvent = 1; // just bind Events 1 time
        }


      this._info = this.shadowRoot.querySelector('.info');
      this._info.innerHTML = data.description;

      // final procedures to show,etc., focus handling, storaing last focus element
      document.body.classList.add("dimmed"); // disable other components/elements of app
      if (lastFocusedElement===null) {this._previouslyFocusedElement = document.activeElement;      
      } else {
        this._previouslyFocusedElement = lastFocusedElement;
      }
      this.shadowRoot.querySelector(".container").focus();
     }

     _renderCarouselFromArray() {
        this._imgContainer.innerHTML="";
        this._imgArray_container = document.createElement('div');
        this._imgArray_container.classList.add('img_container_main');

        this._imgContainer.appendChild(this._imgArray_container);
        let imgArrayHtml = "";
        
        this._data.url.forEach((img,index)=>{
            imgArrayHtml = imgArrayHtml + `<div class="img_container_main_div"><div class="tick hidden">✔</div><img loading="lazy" src="${img}" alt="${index}" style="max-height:1024px; max-width:1024px;"/></div>`;
        });
        this._imgArray_container.innerHTML=imgArrayHtml;   

        this._img_container_main_div = Array.from(this._imgArray_container.querySelectorAll('.img_container_main_div'));

        this._img_container_main_div.forEach((item,index)=>{
            item.addEventListener('dblclick',(e)=>{
                e.stopPropagation();
                this._handleItemSelect(this._pos);
            })
        })        

        if (this._effect === "slide") {
            this._imgArray_container.classList.add('effect_slide_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_slide_item');
            }) 
        }

        if (this._effect === "fadeIn") {
            this._imgArray_container.classList.add('effect_fadeIn_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_fadeIn_item');
                element.style.cssText = `height: ${this._carouselHeight}`;
            }) 
        }

        if (this._effect === "zoomin") {
            this._imgArray_container.classList.add('effect_zoomin_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_zoomin_item');
                element.style.cssText = `height: ${this._carouselHeight}`;
            }) 
        }

        if (this._effect === "slideFade") {
            this._imgArray_container.classList.add('effect_slideFade_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_slideFade_item');
            }) 
        }

        if (this._effect === "rotateYaxis") {
            this._imgArray_container.classList.add('effect_rotateYaxis_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_rotateYaxis_item');
            }) 
        }

        if (this._effect === "slideBlur") {
            this._imgArray_container.classList.add('effect_slideBlur_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_slideBlur_item');              
            }) 
        }

        if (this._effect === "curtainReveal") {
            this._imgArray_container.classList.add('effect_curtainReveal_container');
            this._img_container_main_div.forEach(element=>{
                element.classList.add('effect_curtainReveal_item');             
            }) 
        }
        
        
    }

    _handleItemSelect(location) {
        // handle update property      
        const result = this._SelectedItem.find(item=>item===location);
        console.log(result);
        if (result!=undefined) {
           // console.log('vao found');
            this._SelectedItem = this._SelectedItem.filter(item=>item!==location); 
            this._img_container_main_div[location].querySelector('.tick').classList.add('hidden');
            this._thumbnailControl_div[location].querySelector('.tickThumbnail').classList.add('hidden');
           // console.log(this._img_container_main_div[location].querySelector('.tick'));
        } else {
           // console.log('vao cannot be found');
            this._SelectedItem.push(location);       
            this._img_container_main_div[location].querySelector('.tick').classList.remove('hidden'); 
            this._thumbnailControl_div[location].querySelector('.tickThumbnail').classList.remove('hidden'); 
           // console.log(this._img_container_main_div[location].querySelector('.tick'));
        }
        //console.log(this._SelectedItem);


        if (this._tbHeight!="none") {

        }

    }


    _albumShowPos(pos) {   

        if (this._effect==="slide") { // slide 
            const offset = -100*pos;
            this._imgArray_container.style.transform = `translateX(${offset}%)`;            
        } 

        if (this._effect==="fadeIn") {  // fadeIn 
            this._img_container_main_div.forEach(element=>{
                element.classList.remove('active');
            });     
            this._img_container_main_div[pos].classList.add('active');
        }

        if (this._effect==="zoomin") {   // 3. zoomin 
            this._img_container_main_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._img_container_main_div[pos].classList.add('active');
        }

        if (this._effect==="slideFade") {   // 4. slideFade 
            const offset = -100*pos;
            this._imgArray_container.style.transform = `translateX(${offset}%)`;  
            this._img_container_main_div.forEach(element=>{
                element.classList.remove('active');
            });        
            this._img_container_main_div[pos].classList.add('active');
        }

        if (this._effect==="rotateYaxis") {   // 5. Rotate (Y-Axis)
            this._img_container_main_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._img_container_main_div[pos].classList.add('active');
        }

        if (this._effect==="slideBlur") {   // 6. slideBlur
            const offset = -33.333333*pos;
            this._imgArray_container.style.transform = `translateX(${offset}%)`;  
            this._img_container_main_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._img_container_main_div[pos].classList.add('active');
        }

        if (this._effect==="curtainReveal") {   // 7. curtainReveal
            this._img_container_main_div.forEach(element=>{
                element.classList.remove('active');
            });
            this._img_container_main_div[pos].classList.add('active');
        }


        
      

        // handle controlBar
        if (this._tbHeight&&this._tbHeight!="none") this._jumptoThumbnailScrollPos(pos);   
        if (this._dotControl==="true") {
            //this._jumptoDot(pos);    
            this._jumptoDotScroll(pos);
        }


    }    
    
    _renderDotsControl() {
        this._dot_controlBar_container.innerHTML="";
        const aDiv = document.createElement('div');
        aDiv.classList.add('dotsContainer_overlay');
        aDiv.style.cssText = `width:${this._tbNo*30}px`; // 10 * 2 + width/height
        this._dot_controlBar_container.appendChild(aDiv);
        let htmlString = "";
        this._data.url.forEach((img,index)=>{
            htmlString = htmlString + `<div class="dot"></div>`;
        });
        aDiv.innerHTML = `<div class="dotsContainer">${htmlString}</div>`       
        this._dotsContainer = aDiv.querySelector('.dotsContainer');    
        //console.log(this._data.url.length);    
        const dots =  Array.from(this._dotsContainer.querySelectorAll('.dot'));
        dots.forEach((dot,index)=>{
            dot.addEventListener('click',()=>{
                console.log(index);
                this._pos=index;
                this._albumShowPos(this._pos);
            })
        })

        // this._dotsContainer.addEventListener('scroll',()=>{
        //     console.log('scroll');
        // })
    }

    _fromScrollLeft2Mid(scrollLeftValue) {
        let maxScrollLeft = this._dotsContainer.scrollWidth - this._dotsContainer.clientWidth;
        let aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        if (this._data.url.length===this._tbNo) aStep = 0;
        // console.log(`aStep`,aStep);

        const halfNo = (this._tbNo-1)/2;       
        // console.log(halfNo); 
        return Math.round((scrollLeftValue/aStep) + halfNo);
    }

    _jumptoDotScroll(pos) {
        //console.log(`pos`,pos);
        let maxScrollLeft = this._dotsContainer.scrollWidth - this._dotsContainer.clientWidth;
        
        const aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
       // if (this._data.url.length===this._tbNo) aStep = 0;

        const halfNo = (this._tbNo-1)/2;


        this._animateSelectedDot(pos);

        let currentScrollLeft = this._dotsContainer.scrollLeft;
        //console.log(`currentScrollLeft`,currentScrollLeft);
       // console.log(`_fromScrollLeft2Mid`,this._fromScrollLeft2Mid(currentScrollLeft));

        if (this._tbMid!=this._fromScrollLeft2Mid(currentScrollLeft)) this._tbMid=this._fromScrollLeft2Mid(currentScrollLeft);

        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRangeDot(pos,this._tbMid)) {
           // console.log(`inrange`);
            this._dotsContainer.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
           // this._dotsContainer.scrollLeft = aStep*(this._tbMid-halfNo);
           // console.log(this._dotsContainer.scrollLeft);
        } else {           
            //console.log(`outrange`);
            this._tbMid = pos+this._direction*halfNo; 
            // console.log(`pos`,pos);
            // console.log(`this._directionpos`,this._direction);
            // console.log(`halfNo`,halfNo);
            // console.log(`this._tbMid`,this._tbMid);
         
            if (pos<halfNo) this._tbMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._tbMid = this._data.url.length-1 - halfNo; 
            this._dotsContainer.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //this._dotsContainer.scrollLeft = aStep*(this._tbMid-halfNo);
           // console.log( this._dotsContainer.scrollLeft);
        }       
    }

    _animateSelectedDot(pos) {
        //console.log(pos);
        const dotsArray =  Array.from(this._dotsContainer.querySelectorAll('.dot'));
        dotsArray.forEach(dot=>{
            dot.classList.remove('dotActive');
            dot.classList.remove('dotSecondActive');
        })

        if (dotsArray[pos-1]) dotsArray[pos-1].classList.add('dotSecondActive');  
        if (dotsArray[pos+1]) dotsArray[pos+1].classList.add('dotSecondActive');  
        dotsArray[pos].classList.add('dotActive');   
    }

    _jumptoDot(pos) {
        if (pos<0) {
            pos=0;
            this._pos=0;
        }
        if (pos>this._data.url.length-1) {
            pos=this._data.url.length-1;
            this._pos=this._data.url.length-1;
        }      
        console.log(pos);      

        this._animateSelectedDot(pos);
        
        console.log(this._tbMid);       

        const halfNo = (this._tbNo-1)/2;
        let offset;

        if (this._checkInRange(pos,this._tbMid)) {      
            console.log(`inrange`);     
            offset = -(100/this._tbNo)*(this._tbMid-halfNo);
            this._dotsContainer.style.transform = `translateX(${offset}%)`; 
        } else {           
            console.log(`outrange`);
            this._tbMid = pos; 
            if (pos<halfNo) this._tbMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._tbMid = this._data.url.length-1 - halfNo; 
            offset = -(100/this._tbNo)*(this._tbMid-halfNo);
            this._dotsContainer.style.transform = `translateX(${offset}%)`; 
        }       

    }

    _renderThumbnailControl() {
        this._thumbnailControl_container.innerHTML="";
        this._thumbnailControl = document.createElement('div');
        this._thumbnailControl.classList.add('thumbnailControl');
        this._thumbnailControl.style.cssText  = `height:${this._tbHeight}`;
        this._thumbnailControl_container.appendChild(this._thumbnailControl);
        let imgArrayHtml = "";
        let activeClass = "";
     
        
        if (this._layout==="vertical"&&this._tbNo<3) this._tbNo = 3;
        let widthPercentage =100/this._tbNo;
        //if (widthPercentage>33.3) widthPercentage=33.3;
        this._data.url.forEach((img,index)=>{
            if (index===this._pos) {activeClass="active";} else {activeClass = "";}
            imgArrayHtml = imgArrayHtml + `<div class="thumbnailControl_div ${activeClass}" style="width:calc(${widthPercentage}% - ${this._thumbnailGap})"><div class="tickThumbnail hidden">✔</div><img loading="lazy" style="max-height:512px; max-width:512px;" alt="${index}" src="${img}"/></div>`;            
        });
        this._thumbnailControl.innerHTML=imgArrayHtml;       

        this._thumbnailControl_div=Array.from(this._thumbnailControl_container.querySelectorAll('.thumbnailControl_div'));
       // console.log(thumbnailControl_div);
        this._thumbnailControl_div.forEach((item,index)=>{
            let timer;
            //  item.addEventListener('dblclick',(e)=>{
            //     clearTimeout(timer);
            //     console.log(e);
            //     e.stopPropagation();
                           
            // })
            item.addEventListener('click',(e)=>{
                //console.log(e);
                e.stopPropagation();
                if (e.detail === 1) {    
                    timer = setTimeout(() => {
                        this._pos=index;
                        this._albumShowPos(this._pos);
                      //  this._jumptoThumbnailScrollPos(this._pos);// it was a single click
                    }, 200)            
                }     
                if (e.detail === 2) {  
                    clearTimeout(timer);                 
                    this._handleItemSelect(index);// it was a single click
                }   

            })

        })   

       
    }

    _updateThumbnailElement(pos) {
        // highlight one, remove highlight rest
        this._thumbnailControl.querySelectorAll('.thumbnailControl_div').forEach(element=>{
            element.classList.remove('active')
        })
        this._thumbnailControl.querySelectorAll('.thumbnailControl_div')[pos].classList.add('active');
        return this._thumbnailControl.querySelectorAll('.thumbnailControl_div')[pos];        
    }


    _fromScrollLeft2MidThumbnail(scrollLeftValue) {
        let maxScrollLeft = this._thumbnailControl.scrollWidth - this._thumbnailControl.clientWidth;
        // console.log(`scrollWidth`,this._dotsContainer.scrollWidth);
        // console.log(`clientWidth`,this._dotsContainer.clientWidth);
        // console.log(`maxScrollLeft`,maxScrollLeft);
        // console.log(`this._data.url`,this._data.url.length);
        // console.log(`this._tbNo`,this._tbNo);
        let aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        if (this._data.url.length===this._tbNo) aStep = 0;
        // console.log(`aStep`,aStep);

        const halfNo = (this._tbNo-1)/2;       
        // console.log(halfNo); 
        return Math.round((scrollLeftValue/aStep) + halfNo);
    }

    _checkInRangeThumbnailRow(row,midRow) {
        if (Math.abs(row-midRow)<=(this._tbRow-1)/2) return true;
        return false;
    }

    _jumptoThumbnailScrollPos(pos) {  
        //console.log(`highlight pos ${pos}`);
        this._updateThumbnailElement(pos);  // highlight selected thumbnail

        if (this._layout==="horizontal") { //scroll if vertical layout
            let maxScrollTop = this._thumbnailControl.scrollHeight - this._thumbnailControl.clientHeight;
           // console.log(maxScrollTop);
            let KichThuoc = this._thumbnailControl.querySelector('.thumbnailControl_div').clientHeight;
            //console.log(KichThuoc);
            //console.log(`pos`,pos);
            const Pos_Row = this._fromPos1DtoXY2D(this._pos).y-1;
           // console.log(`Pos_Row`,Pos_Row);
            const currentViewedRow = Math.round(this._thumbnailControl.scrollTop/KichThuoc);
            console.log(currentViewedRow);  
            const halfNoRow = (this._tbRow-1)/2;
           // console.log(`halfNoRow`,halfNoRow);
            this._tbMidRow = currentViewedRow + halfNoRow;

           // console.log(`this._tbMidRow`,this._tbMidRow);
          //  console.log(this._checkInRangeThumbnailRow(Pos_Row,this._tbMidRow));
                      
                      
            if (this._checkInRangeThumbnailRow(Pos_Row,this._tbMidRow)) {         
                this._thumbnailControl.scroll({
                    left: 0,
                    top: KichThuoc*(this._tbMidRow-halfNoRow), 
                    behavior: 'smooth'
                });       
            } else {
                this._thumbnailControl.scroll({
                    left: 0,
                    top: KichThuoc*Pos_Row, 
                    behavior: 'smooth'
                });  
            }

    }


 
    if (this._layout!=="horizontal") { //scroll if vertical layout
        
        //console.log(`pos`,pos);
        let maxScrollLeft = this._thumbnailControl.scrollWidth - this._thumbnailControl.clientWidth;
        const aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        const halfNo = (this._tbNo-1)/2;
        let currentScrollLeft = this._thumbnailControl.scrollLeft;

        if (this._tbMid!=this._fromScrollLeft2MidThumbnail(currentScrollLeft)) this._tbMid=this._fromScrollLeft2MidThumbnail(currentScrollLeft);

        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRangeDot(pos,this._tbMid)) {
            console.log(`inrange`);
            this._thumbnailControl.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //console.log(this._thumbnailControl.scrollLeft);
        } else {           
            this._tbMid = pos+this._direction*halfNo; 
        
            if (pos<halfNo) this._tbMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._tbMid = this._data.url.length-1 - halfNo; 
            this._thumbnailControl.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //this._dotsContainer.scrollLeft = aStep*(this._tbMid-halfNo);
            //console.log( this._thumbnailControl.scrollLeft);
            }    
        } 

        if (this._layout!=="horizontal") { //scroll if vertical layout
        
        //console.log(`pos`,pos);
        let maxScrollLeft = this._thumbnailControl.scrollWidth - this._thumbnailControl.clientWidth;
        const aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        const halfNo = (this._tbNo-1)/2;
        let currentScrollLeft = this._thumbnailControl.scrollLeft;

        if (this._tbMid!=this._fromScrollLeft2MidThumbnail(currentScrollLeft)) this._tbMid=this._fromScrollLeft2MidThumbnail(currentScrollLeft);

        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRangeDot(pos,this._tbMid)) {
            console.log(`inrange`);
            this._thumbnailControl.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //console.log(this._thumbnailControl.scrollLeft);
        } else {           
            this._tbMid = pos+this._direction*halfNo; 
        
            if (pos<halfNo) this._tbMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._tbMid = this._data.url.length-1 - halfNo; 
            this._thumbnailControl.scroll({
                left: aStep*(this._tbMid-halfNo),
                top: 0,
                behavior: 'smooth'
            });
            //this._dotsContainer.scrollLeft = aStep*(this._tbMid-halfNo);
            //console.log( this._thumbnailControl.scrollLeft);
            }    
        }
    }


    _jumptoThumbnailScrollPos_OLD(pos) {        
        //console.log('vao _jumptoThumbnailScrollPos ');
        //console.log(this._tbMid);
        if (pos<0) {
            pos=0;
            this._pos=0;
        }
        if (pos>this._data.url.length-1) {
            pos=this._data.url.length-1;
            this._pos=this._data.url.length-1;
        }       

        this._updateThumbnailElement(pos);  // highlight selected thumbnail

        // get max scrollable value
        let maxScrollLeft = this._thumbnailControl.scrollWidth - this._thumbnailControl.clientWidth;
        //console.log(this._thumbnailControl);
        //console.log(this._thumbnailControl.scrollWidth);
        //console.log(this._thumbnailControl.clientWidth);
        //console.log(`maxScrollLeft`,maxScrollLeft);
        // get a distance for 1 image
        const aStep = maxScrollLeft/(this._data.url.length-this._tbNo);
        //console.log(`aStep`,aStep);
        const halfNo = (this._tbNo-1)/2;

        // Scroll to Mid position if out range or no scroll if thumbnails are seen in viewport 
        if (this._checkInRange(pos,this._tbMid)) {
            //console.log(`inrange`);
            this._thumbnailControl.scrollLeft = aStep*(this._tbMid-halfNo);
            console.log(this._thumbnailControl.scrollLeft);
        } else {           
            //console.log(`outrange`);
            this._tbMid = pos; 
            if (pos<halfNo) this._tbMid = halfNo; 
            if (pos>this._data.url.length-1-halfNo) this._tbMid = this._data.url.length-1 - halfNo; 
            this._thumbnailControl.scrollLeft = aStep*(this._tbMid-halfNo);
            console.log( this._thumbnailControl.scrollLeft);
        }       

    }   

    _checkInRangeDot(pos,middlePoint) {
        if (Math.abs(pos-middlePoint)<=(this._tbNo-1)/2) return true;
        return false;
    }
    
    _checkInRange(pos,middlePoint) {
        if (Math.abs(pos-middlePoint)<(this._tbNo-1)/2) return true;
        return false;
    }

    _prev() {
        console.log('prev');
        if (this._pos>0) {         
            this._pos--;  
            this._direction=-1;
            this._albumShowPos(this._pos);      
            console.log(`this._direction`,this._direction);
        }
    }

    _next() {
        console.log('next');
        if (this._pos<this._data.url.length-1) {       
            this._pos++;   
            this._direction=1;
            this._albumShowPos(this._pos);
  
            console.log(`this._direction`,this._direction);
        }
    }






    _bindEvents() {
        this._leftBtn.addEventListener('click',this._prev.bind(this));        
        this._rightBtn.addEventListener('click',this._next.bind(this));   
        this._closeBtn.addEventListener('click', ()=> { this._hideOverlay(); });   
        
        // Swipe support
        this._swipeStart = null;
        this._imgArray_container.addEventListener("touchstart", this._onSwipeStart.bind(this));
        this._imgArray_container.addEventListener("touchend", this._onSwipeEnd.bind(this));
    
        // Keyboard navigation
        window.addEventListener("keydown", this._onKeyDown.bind(this));
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

    _handleOverlayClick () {
        this._overlay.addEventListener('click',(e)=>{    
            e.stopPropagation();
            if (e.target != this._overlay) return;
            this._hideOverlay();
        })
    }
  
    _hideOverlay() {
      this.hidden = true;
      document.body.classList.remove("dimmed"); // enable other components/elements of app
      if (this._previouslyFocusedElement) {
        this._previouslyFocusedElement.focus();
      }
    }

    _removeOverlay () {
        this._hideOverlay();
        this._handleEventCreation(null,'remove_thisCustomElement');     
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
            this._hideOverlay();
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
  
 