import IListing from "../../domain/IListing";

export async function copyEbayListing(itemNumber: string): Promise<void> {
  function checkReadyState() {
    return new Promise<void>((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Page load timed out after 10 seconds'));
      }, 10000); // 10 seconds timeout
  
      function check() {
        if(document.readyState === 'complete') {
          clearTimeout(timeoutId);
          console.log('readyState is complete');
          copyListing();
          resolve();
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }
  
      check();
    });
  }

  function copyListing() {
    return new Promise<void>((resolve, reject) => {
      try{
        let listing: IListing = {
          itemNumber: itemNumber,
          itemTitle: '',
          price: '',
          shipping: {
            majorWeight: 0,
            minorWeight: 0,
            packageLength: 0,
            packageWidth: 0,
            packageHeight: 0
          },
          images: [],
          description: ''
        };
        checkPostageElement(listing); 
        retrieveImages(listing);
        chrome.runtime.sendMessage({ action: 'listingCopied', listing: listing});
        resolve();
      }catch(e){
        console.log(e);
        reject(e as Error);   
      }
    });
  }

  function checkPostageElement(ebayListing: IListing) {
    try{
        let majorElement = document.querySelector('input[name="majorWeight"]') as HTMLInputElement;
        let minorElement = document.querySelector('input[name="minorWeight"]') as HTMLInputElement;
        let packageLength = document.querySelector('input[name="packageLength"]') as HTMLInputElement;
        let packageWidth = document.querySelector('input[name="packageWidth"]') as HTMLInputElement;
        let packageHeight = document.querySelector('input[name="packageDepth"]') as HTMLInputElement;
        let title = document.querySelector('input[name="title"]') as HTMLInputElement;
        let price = document.querySelector('input[name="price"]') as HTMLInputElement;

        ebayListing.itemTitle = title.value;
        ebayListing.price = price.value;  
        ebayListing.shipping.majorWeight = majorElement.value === '' ? 0 : parseInt(majorElement.value);
        ebayListing.shipping.minorWeight = minorElement.value === '' ? 0 : parseInt(minorElement.value);
        ebayListing.shipping.packageLength = packageLength.value === '' ? 0 : parseInt(packageLength.value);
        ebayListing.shipping.packageWidth = packageWidth.value === '' ? 0 : parseInt(packageWidth.value);
        ebayListing.shipping.packageHeight = packageHeight.value === '' ? 0 : parseInt(packageHeight.value);

        if (majorElement) {
            console.log('retrievePostage');
            console.log(majorElement.innerText);
            chrome.runtime.sendMessage({ 
                action: 'queueEbayPostage', 
                majorElement: majorElement.value === '' ? 0 : majorElement.value, 
                minorElement: minorElement.value === '' ? 0 : minorElement.value,
                packageLength: packageLength.value === '' ? 0 : packageLength.value,
                packageWidth: packageWidth.value === '' ? 0 : packageWidth.value,
                packageHeight: packageHeight.value === '' ? 0 : packageHeight.value,
                item: itemNumber});

        } else {
            setTimeout(checkPostageElement, 1000); // wait for 1 second before checking again
        }
    }catch(e){
        console.log(e);
    }
  }

  function retrieveImages(ebayListing: IListing) {
    let imageElements = document.querySelectorAll('.uploader-thumbnails__inline-edit') ;
    if (imageElements.length > 0) {
      imageElements.forEach((element) => {
        const backgroundImageString = element.getElementsByTagName('button')[0].getAttribute('style') as string;
        const startIdx = backgroundImageString.indexOf('url(') + 4;
        const endIdx = backgroundImageString.indexOf(')');

        let imageUrl = backgroundImageString.substring(startIdx, endIdx);
        console.log('retrieveImages');
        console.log(imageUrl);
        ebayListing.images.push(imageUrl);
      });
    } else {
      setTimeout(retrieveImages(ebayListing), 1000); // wait for 1 second before checking again
    }
  }
  }
  
  await checkReadyState();
}

export async function copyDescription(ebayListing: IListing) {
  
  function checkReadyState() {
    return new Promise<void>((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Page load timed out after 10 seconds'));
      }, 10000); // 10 seconds timeout
  
      function check() {
        if(document.readyState === 'complete') {
          clearTimeout(timeoutId);
          console.log('readyState is complete');
          retrieveDescription(ebayListing); 
          resolve();
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }
  
      check();
    });
    
  }

  function retrieveDescription(listing: IListing) {
    return new Promise((resolve, reject) => {
      try{
        function checkDescElement() {
            let descElement = document.querySelector('div[data-testid="x-item-description-child"]');
            console.log('retrieveDescription');
            console.log(descElement); 
            if (descElement) {
              listing.description = descElement.textContent!.trim();
            
              chrome.runtime.sendMessage({ action: 'descCopied', listing: listing});
              chrome.runtime.sendMessage({ action: 'updateDesc', desc: listing.description, item: listing.itemNumber});
              resolve(ebayListing);
          } else {
            setTimeout(checkDescElement, 1000); // wait for 1 second before checking again
          }
        }
        checkDescElement();
      }catch(e){
        console.log(e);
        reject();   
      }
    });
  }

  console.log('copyEbayDescriptions');
  await checkReadyState();
}