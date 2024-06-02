export async function createMercariListing(){
  function checkReadyState(){
    return new Promise((resolve, reject) => {
      if(document.readyState === 'complete'){
        console.log('Document is ready');
        setDescription();
        resolve();
      }else{
        console.log('Document is not ready, checking again in 1 second');
        setTimeout(() => {
          checkReadyState().then(resolve).catch(reject);
        }, 1000);
      }
    }).catch(console.error);
  }
  
    function setPrice(price) { 
      const el = document.querySelector('input[name="sellPrice"]');
      if (el) {
          el.addEventListener('input', (e) => {
              console.log('input event fired');
              console.log(e.target.value);
          });
          el.addEventListener('change', (e) => {
              console.log('change event fired');
              console.log(e.target.value);
          }); 
          el.addEventListener('focus', (e) => {
              console.log('focus event fired');
              console.log(e.target.value);
          });
          el.addEventListener('keydown', (e) => { 
              setTimeout(() => {
                document.querySelector('button[data-testid="ListButton"]').click();
              }, 2000);
          
              console.log('keydown event fired');
              console.log(e.target.value);
          });
          el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
          el.value = parseFloat(price);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          
          let event = new KeyboardEvent('keydown', {bubbles: true,  key: 'Enter' });
          el.dispatchEvent(event);
          console.log(price);
      } else {
          console.error('Input field not found');
          setTimeout(() => setPrice(price), 1000);
      }
    }
    
    function setDescription() {
      try{
        let listing =  {
            "id": "c87243f3-d72d-45b3-b177-e5fe813519c9",
            "itemNumber": "186447582143",
            "itemTitle": "Waechtersbach Large Tea Kettle High Fired Ceramic Earthenware Floral Motif Gift",
            "description": "Steep in the elegance of tradition with this Waechtersbach large tea kettle, masterfully crafted from high fired ceramic earthenware. Renowned for its quality and durability, this kettle boasts a beautifully hand-painted floral motif, adding a touch of timeless beauty to any kitchen decor. Its ample size ensures a generous brew, making it perfect for gatherings or quiet afternoons. A harmonious blend of form and function, this kettle is a testament to Waechtersbach's commitment to craftsmanship. Present it as a cherished gift or make it the centerpiece of your tea rituals. Secure this exquisite piece today and savor the luxury of fine earthenware in every cup. Please note that this pot is in great condition but it does have a small crack at the base of its handle (pictured).  \n\n\n\n\n\n\n\n",
            "salesChannel": null,
            "active": true,
            "salesChannelId": "28e91dfe-9a9d-482d-4aed-08db50d0bd42",
            "crossPostId": null,
            "dateListed": "2024-05-17T17:29:00",
            "dateEnded": null,
            "dateSold": null,
            "lastUpdated": "2024-05-20T01:13:02",
            "price": 17
          };

          alert("Opening new listing page");
          let el = document.querySelector('[data-testid="Title"]');
          setListingDetails(el, listing.itemTitle);
          el = document.querySelector('[data-testid="Description"]');
          setListingDetails(el, listing.description);
          setPrice(listing.price);
      }catch(e){
        console.log(e);
      }    
    }

    function setListingDetails(el, listingValue) {

      if (el) {
          el.addEventListener('input', (e) => {
              console.log('input event fired');
              console.log(e.target.value);
          });
          el.addEventListener('change', (e) => {
              console.log('change event fired');
              console.log(e.target.value);
          });
          el.addEventListener('focus', (e) => {
              console.log('focus event fired');
              console.log(e.target.value);
          });
          el.addEventListener('keydown', (e) => {
              console.log('keydown event fired');
              console.log(e.target.value);
          });
          el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
          el.value = listingValue;
          el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    console.log('createMercariListing');
    await checkReadyState();
}