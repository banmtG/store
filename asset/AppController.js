class AppController {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Listen for custom events emitted by web components
        document.addEventListener("user-updated", (event) => {
            const { userId, data } = event.detail;

            // Update the application state
            StateStore.setState(`user-${userId}`, data);

            // Persist the state if needed
            LocalStorageManager.setItem(`user-${userId}`, data);
        });

        // Listen for other global events or state changes
        StateStore.subscribe((key, value) => {
            if (key.startsWith("user-")) {
                this.updateComponents(key, value);
            }
        });
    }

    updateComponents(key, value) {
        // Example: Dynamically update a web component based on the state
        const userDisplay = document.querySelector("web-component-a");
        if (userDisplay) {
            userDisplay.dispatchEvent(new CustomEvent("state-changed", { 
                detail: { key, value } 
            }));
        }
    }
}

// Initialize the AppController
document.addEventListener("DOMContentLoaded", () => {
    new AppController();
});
