export async function createMercariListing(ebayListing){
  function checkReadyState(){
    return new Promise((resolve, reject) => {
      if(document.readyState === 'complete'){
        console.log('Document is ready');
        setDescription(ebayListing);
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
    
    async function setDescription(listing) {
      try{

          alert("Opening new listing page");
          listing.images.forEach(async image => {
            console.log('Attempting Image Upload ');
            let blob = await fetchImageAsBlob(image);
            let file = new File([blob], "image.png", {type: "image/png"});
            // Select the file input element
            const fileInput = document.querySelector('input[type="file"]');
            if (!fileInput) {
                console.error('File input not found');
            }
            // Create a new 'change' event
            const event = new Event('change', { bubbles: true });
  
            // Create a new DataTransfer object
            let dt = new DataTransfer();
  
            // Add the file to the DataTransfer object
            dt.items.add(file);
  
            // Assign the files property of the DataTransfer object to fileInput.files
            fileInput.files = dt.files;
  
            console.log('File added to input');
            console.log(fileInput.files);
  
            // Dispatch the 'change' event
            fileInput.dispatchEvent(event);
            console.log('change event dispatched file added to input');
          });
         
          let el = document.querySelector('[data-testid="Title"]');
          setListingDetails(el, listing.itemTitle);
          el = document.querySelector('[data-testid="Description"]');
          setListingDetails(el, listing.description);
          setPrice(listing.price);
      }catch(e){
        console.log(e);
      }    
    }

    async function fetchImageAsBlob(url) {
      // Fetch the image
      console.log('starting download');
      let response = await fetch(url).catch(console.error);
  
      // Get the response as a blob
      let blob = await response.blob();
      console.log('file downloaded');
      // Return the blob
      return blob;
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