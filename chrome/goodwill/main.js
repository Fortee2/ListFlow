function scrapGoodwill() {
    function checkReadyState() {
      return new Promise((resolve, reject) => {
        if(document.readyState === "complete") {
          console.log("readyState is complete");
          retrieveAuction();
        } else {
          console.log("readyState is not complete");
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    }
  
    function retrieveAuction() {
      //Get the title
      let serverAttribute = document.querySelector("app-loader-container").attributes[0].name;
      let timeLeft = document.querySelectorAll(`span[${serverAttribute}]`)[0].getElementsByTagName("span")[0].innerText;
      let price = document.querySelectorAll(`h3[${serverAttribute}]`)[1].innerText;
      let futureTime = calculateFutureTime(timeLeft);
  
      console.log("futureTime: " + futureTime.gy);
  
      setTimeout(() => {
        executeBid();
      }, futureTime - 10000);
      
      console.log("futureTime: " + futureTime); 
      console.log("price: " + price); 
  
    }
  
    function calculateFutureTime(timeString) {
      // Split the time string into its components
      const timeComponents = timeString.split(" ");
  
      // Initialize the total minutes
      let totalMinutes = 0;
  
      // Process each component
      for (const component of timeComponents) {
          // Get the unit (the last character of the component)
          const unit = component.slice(-1);
  
          // Get the value (all but the last character of the component)
          const value = parseInt(component.slice(0, -1));
  
          // Add the appropriate number of minutes to the total
          switch (unit) {
              case "d":
                  totalMinutes += value * 24 * 60;
                  break;
              case "h":
                  totalMinutes += value * 60;
                  break;
              case "m":
                  totalMinutes += value;
                  break;
          }
      }
  
      // Return the future date and time
      return totalMinutes * 60000;
    }
  
    function executeBid() {
      let el = document.getElementById("currentBid");
      if (el) {
        el.addEventListener("input", (e) => {
            console.log("input event fired");
            console.log(e.target.value);
        });
        el.addEventListener("change", (e) => {
            console.log("change event fired");
            console.log(e.target.value);
        }); 
        el.addEventListener("focus", (e) => {
            console.log("focus event fired");
            console.log(e.target.value);
        });
        el.addEventListener("keydown", (e) => { 
            setTimeout(() => {
              document.querySelector('button[class="btn btn-purple btn-lg btn-block d-print-none ng-star-inserted"]').click();
              setTimeout(() => {
                document.querySelector('button[class="btn btn-primary ng-star-inserted"]').click();},1000);
            }, 1000)
        
            console.log("keydown event fired");
            console.log(e.target.value);
        }); 
        el.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
        el.value = parseFloat("60");
        el.dispatchEvent(new Event("input", { bubbles: true }));
        
        let event = new KeyboardEvent("keydown", {bubbles: true,  key: "Enter" });
        el.dispatchEvent(event);
      }
    }
    checkReadyState();
  }