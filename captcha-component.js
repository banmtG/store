  class CaptchaComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.url='https://script.google.com/macros/s/AKfycbzDbE8GjTsH4Mu6euzndMRI-bNnUGceeHHfAGX41RFCqftwd7XSEuIlu9y2MF-VeU_1Ag/exec?action=generate&s=2.5';
      this.componentCSS = `<link rel="stylesheet" href="./captcha-component.css" />`;
    }
  
    connectedCallback() {
      // HTML content with iframe embedded
      this.shadowRoot.innerHTML = `${this.componentCSS}
      <loading-icon class="loading-icon" index1000 loadingstyle="roller" scale="1" maincolor="#1c4c5b" opacityvalue="90%"></loading-icon>  
      <iframe id="captchaIframe" src="${this.url}"  class="responsive-iframe"></iframe>
      `;

      const loadingFetch_icon = this.shadowRoot.querySelector(".loading-icon");
     // document.insertAdjacentHTML("beforeend" , loadingFetch_icon); 

      const iframe = this.shadowRoot.getElementById("captchaIframe");
      iframe.addEventListener("load", function() {
        console.log(`vao day`);
        loadingFetch_icon.remove();
       // document.querySelector('.loading-icon').remove();
      });

      // Set up a message listener
      window.addEventListener("message", this.receiveMessage.bind(this));
    }
  
    disconnectedCallback() {
      // Clean up the event listener when the component is removed from the DOM
      window.removeEventListener("message", this.receiveMessage.bind(this));
    }
  
    receiveMessage(event) {
        // Temporarily log the origin to see what's coming in
        console.log("Message received from origin:", event.origin);
      
       // Remove or modify this line if origin matching is not required temporarily
        // if (event.origin !== "https://n-bue2lo5ne5xgpnp7unkljzu7kjqzaxmrdiyeh7a-0lu-script.googleusercontent.com") {
        //   console.warn("Invalid message origin:", event.origin);
        //   return;
        // }
      
        const { status, data } = event.data;
        if (status === "OK") {
          console.log("Data received from iframe:", data);
          this.dispatchEvent(new CustomEvent("captchaVerified", { detail: data }));
        }
      }

      
  }
  
  // Define the new web component
  customElements.define("captcha-component", CaptchaComponent);
  