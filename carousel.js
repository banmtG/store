class PhotoCarousel extends HTMLElement {
    constructor() {
      super();
  
      // Attach shadow DOM
      this.attachShadow({ mode: "open" });
  
      // Default properties
      this.photos = [];
      this.currentIndex = 0;
      this.effect = "slide"; // Default effect
      this.layout = "dots"; // dots | thumbnails
        
      // Initial HTML structure
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            position: relative;
            width: 100%;
            max-width: 800px;
            overflow: hidden;
          }
  
          .carousel-container {
            position: relative;
            width: 100%;
          }
  
          .carousel {
            display: flex;
            transition: transform 0.5s ease-in-out;
            transform: translateX(0);
            width: 100%;
          
          }
  
          .carousel img {
            width: 100%;
            flex-shrink: 0;
            object-fit: cover;
            user-select: none;
            pointer-events: none;
          }
  
          .controls {
            position: absolute;
            top: 50%;
            width: 100%;
            display: flex;
            justify-content: space-between;
            transform: translateY(-50%);
            z-index: 10;
          }
  
          .controls button {
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            font-size: 16px;
          }
  
          .progress-bar {
            display: flex;
            justify-content: center;
            gap: 10px;
            position: absolute;
            bottom: 10px;
            width: 100%;
            z-index: 10;
          }
  
          .progress-bar img,
          .progress-bar .dot {
            width: 40px;
            height: 40px;
            cursor: pointer;
          }
  
          .progress-bar img {
            border: 2px solid transparent;
          }
  
          .progress-bar img.active {
            border-color: white;
          }
  
          .progress-bar .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
          }
  
          .progress-bar .dot.active {
            background: gray;
          }
  
          /* Thumbnail layout */
          .carousel-container.thumbnails-layout {
            display: flex;
            flex-direction: row-reverse;
            gap: 10px;
          }
  
          .thumbnails {
            display: flex;
            flex-direction: column;
            gap: 10px;
            overflow-y: auto;
          }
  
          .thumbnails img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            cursor: pointer;
            border: 2px solid transparent;
          }
  
          .thumbnails img.active {
            border-color: gray;
          }
        </style>
  
        <div class="carousel-container">
          <div class="thumbnails" hidden></div>
          <div class="main-carousel">
            <div class="carousel"></div>
            <div class="controls">
              <button class="prev">&lt;</button>
              <button class="next">&gt;</button>
            </div>
            <div class="progress-bar"></div>
          </div>
        </div>
      `;
    }
  
    connectedCallback() {
      this._bindEvents();
      this._initialize();
    }
  
    disconnectedCallback() {
      this._unbindEvents();
    }
  
    static get observedAttributes() {
      return ["effect", "layout"];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this[name] = newValue;
        this._initialize();
      }
    }
  
    set data(data) {
      this.photos = data.map((item) => item.photo);
      this._initialize();
    }
  
    _initialize() {
      const carousel = this.shadowRoot.querySelector(".carousel");
      carousel.innerHTML = this.photos
        .map((photo, index) => `<img src="${photo}" loading="lazy" alt="Photo ${index + 1}" />`)
        .join("");
  
      this._renderProgressBar();
      this._updateView();
    }
  
    _bindEvents() {
      const prevBtn = this.shadowRoot.querySelector(".prev");
      const nextBtn = this.shadowRoot.querySelector(".next");
      prevBtn.addEventListener("click", this._prev.bind(this));
      nextBtn.addEventListener("click", this._next.bind(this));
  
      // Swipe support
      this._swipeStart = null;
      this.shadowRoot.addEventListener("touchstart", this._onSwipeStart.bind(this));
      this.shadowRoot.addEventListener("touchend", this._onSwipeEnd.bind(this));
  
      // Keyboard navigation
      window.addEventListener("keydown", this._onKeyDown.bind(this));
    }
  
    _unbindEvents() {
      window.removeEventListener("keydown", this._onKeyDown.bind(this));
    }
  
    _prev() {
      if (this.currentIndex > 0) this.currentIndex--;
      this._updateView();
    }
  
    _next() {
      if (this.currentIndex < this.photos.length - 1) this.currentIndex++;
      this._updateView();
    }
  
    _updateView() {
      const carousel = this.shadowRoot.querySelector(".carousel");
      const thumbnails = this.shadowRoot.querySelectorAll(".thumbnails img");
      const progressDots = this.shadowRoot.querySelectorAll(".progress-bar .dot");
  
      // Move carousel
      const offset = -this.currentIndex * 100;
      carousel.style.transform = `translateX(${offset}%)`;
  
      // Update thumbnails and dots
      thumbnails.forEach((thumb, index) => thumb.classList.toggle("active", index === this.currentIndex));
      progressDots.forEach((dot, index) => dot.classList.toggle("active", index === this.currentIndex));
    }
  
    _renderProgressBar() {
      const progressBar = this.shadowRoot.querySelector(".progress-bar");
      const thumbnailsContainer = this.shadowRoot.querySelector(".thumbnails");
      const layout = this.layout;
  
      if (layout === "dots") {
        progressBar.innerHTML = this.photos
          .map((_, index) => `<div class="dot" data-index="${index}"></div>`)
          .join("");
      } else if (layout === "thumbnails") {
        progressBar.innerHTML = "";
        thumbnailsContainer.innerHTML = this.photos
          .map((photo, index) => `<img src="${photo}" data-index="${index}" alt="Photo ${index + 1}" />`)
          .join("");
        thumbnailsContainer.hidden = false;
      }
    }
  
    _onSwipeStart(event) {
      this._swipeStart = event.touches[0].clientX;
    }
  
    _onSwipeEnd(event) {
      const end = event.changedTouches[0].clientX;
      if (this._swipeStart - end > 50) this._next();
      if (end - this._swipeStart > 50) this._prev();
    }
  
    _onKeyDown(event) {
      if (event.key === "ArrowLeft") this._prev();
      if (event.key === "ArrowRight") this._next();
    }
  }
  
  customElements.define("photo-carousel", PhotoCarousel);
  