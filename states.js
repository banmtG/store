class StateStore {
    static state = { app: "Jolie catering" }; // Shared state object
    static listeners = []; // Listeners to notify on state changes
    static history = [{ ...StateStore.state }]; // State history for undo
    static history_min = this.history.length;
    static history_pos = this.history_min;
  
    // Set state with history tracking
    static setState(key, value) {

      StateStore.state[key] = value;
  
        if (this.history_pos !== this.history.length)     
        { 
            this.history = this.history.slice(0,this.history_pos);          
        } 
        this.history.push({ ...StateStore.state }); 
        this.history_pos = this.history.length;
   
      // Dispatch event for global listeners
        document.dispatchEvent(new CustomEvent("state-change", { detail: { key, value } }));
  
       // Notify all listeners
        this.listeners.forEach((listener) => listener(key, value));
       // console.log(StateStore.state);
        //console.log(`history`, StateStore.history.length, JSON.stringify(StateStore.history));
       // console.log(`this.history_pos`, this.history_pos);

    }
  
    // Undo the last state change
    static undo() {
      // console.log(this.history_pos);

       // console.log(`history`, StateStore.history.length, JSON.stringify(StateStore.history));
      if (this.history_pos === this.history_min) {
        console.warn("No state to undo.");
        console.log(StateStore.state);
        return;
      }
      // Revert to the previous state
      this.history_pos = this.history_pos-1;  
      const previousState = {...this.history[this.history_pos-1]}; // get last item of Array
      StateStore.state = previousState;
  
      // Dispatch event and notify listeners of the undo
      document.dispatchEvent(new CustomEvent("state-change", { detail: { key: "undo", state: previousState } }));
      this.listeners.forEach((listener) => listener("undo", previousState));
      console.log(StateStore.state);
     // console.log(`history`, StateStore.history.length, JSON.stringify(StateStore.history));
     // console.log(`this.history_pos`,this.history_pos);
    }

    static redo() {
        //console.log(`history`, StateStore.history.length, JSON.stringify(StateStore.history));
       
        if (this.history.length === this.history_pos) {
          console.warn("No state to redo.");
          console.log(StateStore.state);
          return;
        }
 // Revert to the previous state
        this.history_pos++;       
        const redoState = {...this.history[this.history_pos-1]}; // get last item of Array
        StateStore.state = redoState;
    
        // Dispatch event and notify listeners of the undo
        document.dispatchEvent(new CustomEvent("state-change", { detail: { key: "redo", state: redoState } }));
        this.listeners.forEach((listener) => listener("redo", redoState));
        console.log(StateStore.state);
       // console.log(`this.history_pos`,this.history_pos);
      //  console.log(`history`, StateStore.history.length, JSON.stringify(StateStore.history));

      }
  
    // Subscribe a listener to state changes
    static subscribe(listener) {
      this.listeners.push(listener);
    }
  
    // Get a specific state value
    static getState(key) {
      return StateStore.state[key];
    }
  
    // Get the entire state object
    static getStateObject() {
      return { ...StateStore.state };
    }
  }
  

////////////////USAGE EXAMPLE//////////////////////////

  
let aComplexObj = { 
    "accounting" : [   
                       { "firstName" : "John",  
                         "lastName"  : "Doe",
                         "age"       : 23 },
  
                       { "firstName" : "Mary",  
                         "lastName"  : "Smith",
                          "age"      : 32 }
                   ],                            
    "sales"      : [ 
                       { "firstName" : "Sally", 
                         "lastName"  : "Green",
                          "age"      : 27 },
  
                       { "firstName" : "Jim",   
                         "lastName"  : "Galley",
                         "age"       : 41 }
                   ] 
  } ;
  
  let anComplexArray = {
  "problems": [{
      "Diabetes":[{
          "medications":[{
              "medicationsClasses":[{
                  "className":[{
                      "associatedDrug":[{
                          "name":"asprin",
                          "dose":"",
                          "strength":"500 mg"
                      }],
                      "associatedDrug#2":[{
                          "name":"somethingElse",
                          "dose":"",
                          "strength":"500 mg"
                      }]
                  }],
                  "className2":[{
                      "associatedDrug":[{
                          "name":"asprin",
                          "dose":"",
                          "strength":"500 mg"
                      }],
                      "associatedDrug#2":[{
                          "name":"somethingElse",
                          "dose":"",
                          "strength":"500 mg"
                      }]
                  }]
              }]
          }],
          "labs":[{
              "missing_field": "missing_value"
          }]
      }],
      "Asthma":[{}]
  }]};
  // Set some states
  StateStore.setState("theme", "dark");
  StateStore.setState("fontSize", "large");
  
  // StateStore.subscribe(handleTaskA)
  
  // function handleTaskA(key,value) {
  //     console.log(key, value);
  // }
  
  StateStore.setState("complex", aComplexObj);
  
  StateStore.setState("pos", 3);
  StateStore.setState("fontSize", anComplexArray);
  // Undo the last state change
  //StateStore.undo(); // Reverts to the state with "theme: dark"
  
  // Fetch current state
  console.log(StateStore.getStateObject()); // { theme: "dark" }

      // Subscribe to state changes
// StateStore.subscribe((key, value) => {
//   if (key === "undo") {
//     console.log("State reverted to:", value);
//   } else {
//     console.log(`State changed: ${key} = ${value}`);
//   }
// });
