import IListing from "../../domain/IListing";

export async function createListing(ebayListing: IListing): Promise<void> {
    function checkReadyState(){
      return new Promise<void>(async (resolve, reject) => {
        if(document.readyState === 'complete'){
          console.log('Document is ready');
          await setDescription(ebayListing);
          resolve();
        }else{
          console.log('Document is not ready, checking again in 1 second');
          setTimeout(() => {
            checkReadyState().then(resolve).catch(reject);
          }, 1000);
        }
      }).catch(console.error);
    }
    
/*     function setPrice(price) { 
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
  
            el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            el.value = parseFloat(price);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            
            let event = new KeyboardEvent('keydown', {bubbles: true,  key: 'Enter' });
            el.dispatchEvent(event);
            console.log(price);
        } else {;
            setTimeout(() => setPrice(price), 1000);
        }
    }
      
    function setWeight(pounds, ounces) { 
      const el = document.querySelector('input[name="weight_in_pounds"]');
      
      if (el) {
          setElementValue(el, pounds);
          const el2 = document.querySelector('input[name="weight_in_ounces"]');
          setElementValue(el2, ounces);
      } else {
          setTimeout(() => setWeight(pounds, ounces), 1000);
      }
    }
  
    function setPackageDimensions(length, width, height) {
        const el = document.querySelector('input[data-testid="InputLength"]');
        const el2 = document.querySelector('input[data-testid="InputWidth"]');
        const el3 = document.querySelector('input[data-testid="InputHeight"]');
        
        if (el) {
          setElementValue(el, length);
          setElementValue(el2, width);
          setElementValue(el3, height);
        } else {
            setTimeout(() => setPackageDimensions(length, width, height), 1000);
        }
      } */
  
      async function setDescription(listing: IListing) {
        try{

            let titleLabel = document.querySelector('label[aria-label="Title"]') as HTMLLabelElement;
            let titleId = titleLabel.getAttribute('for') ?? '';
            let el = document.getElementById(titleId) as HTMLInputElement;
            console.log(el);    
            setElementValue(el, listing.itemTitle);
            console.log(listing.itemTitle);

            let descriptionLabel = document.querySelector('label[aria-label="Description"]') as HTMLLabelElement;
            let descriptionId = descriptionLabel.getAttribute('for') ?? '';
            let textContent = document.getElementById(descriptionId) as HTMLTextAreaElement;
           
            if (listing.description.length < 1000 - listing.itemNumber.length - 4) {
              listing.description = listing.description + '\n ['+listing.itemNumber+']';
            }
            setElementValue(textContent, listing.description);
  
            let priceLabel = document.querySelector('label[aria-label="Price"]') as HTMLLabelElement;
            let priceId = priceLabel.getAttribute('for') ?? '';
            let priceText = document.getElementById(priceId) as HTMLInputElement;

            setElementValue(priceText, listing.price);

            uploadImages(listing.images);
/*             setWeight(listing.shipping.majorWeight, listing.shipping.minorWeight);
            setPackageDimensions(listing.shipping.packageLength, listing.shipping.packageWidth, listing.shipping.packageHeight);
            setPrice(listing.price);
            tagListButton(); */
        }catch(e){
          console.log(e);
        }    
      }
  
    async function uploadImages(imageUrls: string[]) {
        imageUrls.forEach(async image => {
            console.log(image);
            console.log('Attempting Image Upload ');
            let blob = await fetchImageAsBlob(image);
            let file = new File([blob], "image.png", {type: "image/png"});
            // Select the file input element
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
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
            // Dispatch the 'change' event
            fileInput.dispatchEvent(event);
            console.log('change event dispatched file added to input');
        }); 
    }


     async function fetchImageAsBlob(url: string): Promise<Blob> {
        // Fetch the image
        let response = await fetch(url).catch(console.error) as Response;
    
        // Get the response as a blob
        let blob = await response.blob();
        // Return the blob
        return blob;
      } 
  
      function setElementValue(el : HTMLInputElement | HTMLTextAreaElement, listingValue: string) {
  
        if (el) {
            el.addEventListener('input', (e) => {
                console.log('input event fired');
            });
            el.addEventListener('change', (e) => {
                console.log('change event fired');
            });
            el.addEventListener('focus', (e) => {
                console.log('focus event fired');
            });
            el.addEventListener('keydown', (e) => {
                console.log('keydown event fired');
            });

            el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            el.value = listingValue;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            let event = new KeyboardEvent('keydown', {bubbles: true,  key: 'Enter' });
            el.dispatchEvent(event);
        }
      }
  
/*       function tagListButton() {
        const el = document.querySelector('button[data-testid="ListButton"]');
        if (el) {
            el.addEventListener('click', (e) => {
                setTimeout(() => {
                    let url = window.location.href;
                    ebayListing.itemNumber = url.split('/')[5],
                    console.log('Listing Created');
                    chrome.runtime.sendMessage({ action: 'mercariCreated', listing: ebayListing});
                }, 2000);
            });
        } else {
            setTimeout(() => tagListButton(), 1000);
        }
      } */
  
      console.log('createMercariListing');
      await checkReadyState();
  }