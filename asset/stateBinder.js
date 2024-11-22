// StateBinder Class: Syncs StateStore with LocalStorage
class StateBinder {
    static namespace = "JCApp"; // Namespace for keys in localStorage

    // Sync state changes with localStorage
    static bindStateToLocalStorage() {
        StateStore.subscribe((key, value) => {
            const storageKey = `${this.namespace}_state_${key}`;
            LocalStorageManager.set(storageKey, value);
        });
    }

    // Load state from localStorage
    static loadStateFromLocalStorage() {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(`${this.namespace}_state_`)) {
                const stateKey = key.replace(`${this.namespace}_state_`, "");
                const value = LocalStorageManager.get(key);
                StateStore.setState(stateKey, value);
            }
        });
    }
}

// Usage Example
// Bind state to localStorage
StateBinder.bindStateToLocalStorage();

// Load state from localStorage when the app starts
StateBinder.loadStateFromLocalStorage();

// Set state normally
StateStore.setState("theme", "dark");

// Access state directly
console.log(StateStore.getState("theme"));

// Access state from localStorage
console.log(LocalStorageManager.get("myApp_state_theme"));