// https://loading.io/css/
// 9dots 2arcs solidCircle 3dots 3bars ripple roller
// const html = `<loading-icon loadingstyle="3bars" scale="2" maincolor="#1c4c5b" opacityvalue="90%"></loading-icon>`;
// document.body.insertAdjacentHTML("beforeend" , html); 

const template_LoadingIconComponent = document.createElement('template');
template_LoadingIconComponent.innerHTML = ``;

const template_LoadingIconComponent_containerStyle=`<style>
.container {
    display: flex;
    justify-content: center;    
    align-items: center;
    height: 100%;
    position: fixed;
    top:0;
    left:0;
    width: 100%;
    z-index:1000;
}`;

class LoadingIconComponent extends HTMLElement {
    constructor() {               
        super();
        this.attachShadow({ mode: 'open' });
        
    };

    scaleS = ``;
    mainColorS = ``;
    opacityValueS = ``;
    cssText=false;

    connectedCallback() {
        //console.log(template_LoadingIconComponent.innerHTML);
        //console.log("connected");
        this.shadowRoot.appendChild(template_LoadingIconComponent.content.cloneNode(true));  
        const icon=this.shadowRoot.querySelector('.container').firstChild;
        //icon.style.border="1px black solid";
        icon.style.transform=this.scaleS;         
        icon.style.color=this.mainColorS;
        icon.style.opacity=this.opacityValueS;

        if (this.cssText==true) {
            //console.log(this.shadowRoot.querySelector('.container'));
            let container = this.shadowRoot.querySelector('.container');
            //container.style.cssText = "display: absolute; width: 100; height:auto; top: auto; right:auto";
            //console.log( this.shadowRoot.querySelector('.container').style.cssText);
        }
    }  

    static get observedAttributes() {
        return ['loadingstyle','scale','maincolor','opacityvalue','index1000']; 
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'loadingstyle') changeLoadingIconTemplate(newValue);    
        if (name === 'scale') this.scaleS=`scale(${newValue})`;
        if (name === 'maincolor') this.mainColorS=newValue;
        if (name === 'opacityvalue') this.opacityValueS=newValue;
        if (name === 'index1000') this.cssText = true;           
        // console.log(name, newValue);
    }    

}
  
    // Define the custom element
customElements.define('loading-icon', LoadingIconComponent);

function changeLoadingIconTemplate(value) {
    if (value=="9dots")
        template_LoadingIconComponent.innerHTML = template_LoadingIconComponent_containerStyle + `     
        .lds-grid{display:inline-block;position:relative;width:80px;height:80px}.lds-grid,.lds-grid div{box-sizing:border-box}.lds-grid div{position:absolute;width:16px;height:16px;border-radius:50%;background:currentColor;animation:1.2s linear infinite lds-grid}.lds-grid div:first-child{top:8px;left:8px;animation-delay:0s}.lds-grid div:nth-child(2){top:8px;left:32px;animation-delay:-.4s}.lds-grid div:nth-child(3){top:8px;left:56px;animation-delay:-.8s}.lds-grid div:nth-child(4){top:32px;left:8px;animation-delay:-.4s}.lds-grid div:nth-child(5){top:32px;left:32px;animation-delay:-.8s}.lds-grid div:nth-child(6){top:32px;left:56px;animation-delay:-1.2s}.lds-grid div:nth-child(7){top:56px;left:8px;animation-delay:-.8s}.lds-grid div:nth-child(8){top:56px;left:32px;animation-delay:-1.2s}.lds-grid div:nth-child(9){top:56px;left:56px;animation-delay:-1.6s}@keyframes lds-grid{0%,100%{opacity:1}50%{opacity:.5}} 
        </style>
    <div class="container"><div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
`;
if (value=="2arcs") 
    template_LoadingIconComponent.innerHTML =  template_LoadingIconComponent_containerStyle + ` 
    <style>
    .lds-dual-ring{color:#1c4c5b;display:inline-block;width:80px;height:80px}.lds-dual-ring,.lds-dual-ring:after{box-sizing:border-box}.lds-dual-ring:after{content:" ";display:block;width:64px;height:64px;margin:8px;border-radius:50%;border:12px solid currentColor;border-color:currentColor transparent;animation:1.2s linear infinite lds-dual-ring}@keyframes lds-dual-ring{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}    
    </style>
    <div class="container"><div class="lds-dual-ring"></div></div>`;

if (value=="solidCircle") 
    template_LoadingIconComponent.innerHTML = template_LoadingIconComponent_containerStyle + ` 
    <style>
    .lds-ring,.lds-ring div{box-sizing:border-box}.lds-ring{display:inline-block;position:relative;width:95px;height:95px}.lds-ring div{display:block;position:absolute;width:64px;height:64px;margin:8px;border:8px solid currentColor;border-radius:50%;animation:1.2s cubic-bezier(.5,0,.5,1) infinite lds-ring;border-color:currentColor transparent transparent}.lds-ring div:first-child{animation-delay:-.45s}.lds-ring div:nth-child(2){animation-delay:-.3s}.lds-ring div:nth-child(3){animation-delay:-.15s}@keyframes lds-ring{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    </style>
    <div class="container"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>
    `;

if (value=="3dots")
        template_LoadingIconComponent.innerHTML = template_LoadingIconComponent_containerStyle + ` 
        <style>
        .lds-ellipsis,.lds-ellipsis div{box-sizing:border-box}.lds-ellipsis{display:inline-block;position:relative;width:80px;height:80px}.lds-ellipsis div{position:absolute;top:33.33333px;width:13.33333px;height:13.33333px;border-radius:50%;background:currentColor;animation-timing-function:cubic-bezier(0,1,1,0)}.lds-ellipsis div:first-child{left:8px;animation:.6s infinite lds-ellipsis1}.lds-ellipsis div:nth-child(2){left:8px;animation:.6s infinite lds-ellipsis2}.lds-ellipsis div:nth-child(3){left:32px;animation:.6s infinite lds-ellipsis2}.lds-ellipsis div:nth-child(4){left:56px;animation:.6s infinite lds-ellipsis3}@keyframes lds-ellipsis1{0%{transform:scale(0)}100%{transform:scale(1)}}@keyframes lds-ellipsis3{0%{transform:scale(1)}100%{transform:scale(0)}}@keyframes lds-ellipsis2{0%{transform:translate(0,0)}100%{transform:translate(24px,0)}}
        </style>
        <div class="container"><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>
        `;

if (value=="3bars")  
            template_LoadingIconComponent.innerHTML = template_LoadingIconComponent_containerStyle + ` 
            <style>
           .lds-facebook,.lds-facebook div{box-sizing:border-box}.lds-facebook{display:inline-block;position:relative;width:80px;height:80px}.lds-facebook div{display:inline-block;position:absolute;left:8px;width:16px;background:currentColor;animation:1.2s cubic-bezier(0,.5,.5,1) infinite lds-facebook}.lds-facebook div:first-child{left:8px;animation-delay:-.24s}.lds-facebook div:nth-child(2){left:32px;animation-delay:-.12s}.lds-facebook div:nth-child(3){left:56px;animation-delay:0s}@keyframes lds-facebook{0%{top:8px;height:64px}100%,50%{top:24px;height:32px}}
            </style>
            <div class="container"><div class="lds-facebook"><div></div><div></div><div></div></div></div>
            `;

if (value=="ripple")  
    template_LoadingIconComponent.innerHTML = template_LoadingIconComponent_containerStyle + ` 
    <style>
    .lds-ripple,.lds-ripple div{box-sizing:border-box}.lds-ripple{display:inline-block;position:relative;width:100px;height:100px}.lds-ripple div{position:absolute;border:10px solid currentColor;opacity:1;border-radius:50%;animation:1s cubic-bezier(0,.2,.8,1) infinite lds-ripple}.lds-ripple div:nth-child(2){animation-delay:-.5s}@keyframes lds-ripple{0%,4.9%{top:36px;left:36px;width:8px;height:8px;opacity:0}5%{top:36px;left:36px;width:8px;height:8px;opacity:1}100%{top:0;left:0;width:80px;height:80px;opacity:0}}
    </style>
    <div class="container"><div class="lds-ripple"><div></div><div></div></div></div>
    `;

if (value=="roller") 
    template_LoadingIconComponent.innerHTML = template_LoadingIconComponent_containerStyle + ` 
    <style>
    .lds-roller,.lds-roller div,.lds-roller div:after{box-sizing:border-box}.lds-roller{display:inline-block;position:relative;width:80px;height:80px}.lds-roller div{animation:1.2s cubic-bezier(.5,0,.5,1) infinite lds-roller;transform-origin:40px 40px}.lds-roller div:after{content:" ";display:block;position:absolute;width:7.2px;height:7.2px;border-radius:50%;background:currentColor;margin:-3.6px 0 0 -3.6px}.lds-roller div:first-child{animation-delay:-36ms}.lds-roller div:first-child:after{top:62.62742px;left:62.62742px}.lds-roller div:nth-child(2){animation-delay:-72ms}.lds-roller div:nth-child(2):after{top:67.71281px;left:56px}.lds-roller div:nth-child(3){animation-delay:-108ms}.lds-roller div:nth-child(3):after{top:70.90963px;left:48.28221px}.lds-roller div:nth-child(4){animation-delay:-144ms}.lds-roller div:nth-child(4):after{top:72px;left:40px}.lds-roller div:nth-child(5){animation-delay:-.18s}.lds-roller div:nth-child(5):after{top:70.90963px;left:31.71779px}.lds-roller div:nth-child(6){animation-delay:-216ms}.lds-roller div:nth-child(6):after{top:67.71281px;left:24px}.lds-roller div:nth-child(7){animation-delay:-252ms}.lds-roller div:nth-child(7):after{top:62.62742px;left:17.37258px}.lds-roller div:nth-child(8){animation-delay:-288ms}.lds-roller div:nth-child(8):after{top:56px;left:12.28719px}@keyframes lds-roller{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}  
    </style>
    <div class="container"><div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
    `;
    

    


}