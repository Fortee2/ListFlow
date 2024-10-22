export async function copyEbayListing(itemNumber) {
  function checkReadyState() {
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
      try{
        let listing = {
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
        retrieveDetails(listing); 
        retrieveImages(listing);
        chrome.runtime.sendMessage({ action: 'listingCopied', listing: listing});
        resolve();
      }catch(e){
        console.log(e);
        reject();   
      }
    });
  }

  function retrieveDetails(ebayListing) {
    return new Promise((resolve, reject) => {
      function checkPostageElement() {
          try{
              let majorElement = document.querySelector('input[name="majorWeight"]');
              let minorElement = document.querySelector('input[name="minorWeight"]');
              let packageLength = document.querySelector('input[name="packageLength"]');
              let packageWidth = document.querySelector('input[name="packageWidth"]');
              let packageHeight = document.querySelector('input[name="packageDepth"]');
              let title = document.querySelector('input[name="title"]');
              let price = document.querySelector('input[name="price"]');

              ebayListing.itemTitle = title.value;
              ebayListing.price = price.value;  
              ebayListing.shipping.majorWeight = majorElement.value === '' ? 0 : majorElement.value;
              ebayListing.shipping.minorWeight = minorElement.value === '' ? 0 : minorElement.value;
              ebayListing.shipping.packageLength = packageLength.value === '' ? 0 : packageLength.value;
              ebayListing.shipping.packageWidth = packageWidth.value === '' ? 0 : packageWidth.value;
              ebayListing.shipping.packageHeight = packageHeight.value === '' ? 0 : packageHeight.value;

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
                  resolve();
              } else {
                  setTimeout(checkPostageElement, 1000); // wait for 1 second before checking again
              }
          }catch(e){
              console.log(e);
              reject();   
          }
          
      }
      checkPostageElement();
    })
  }

  function retrieveImages(ebayListing) {
    return new Promise((resolve, reject) => {
      function checkImageElement() {
        let imageElement = document.querySelectorAll('.uploader-thumbnails__inline-edit');
        if (imageElement) {
          imageElement.forEach((element) => {
            const backgroundImageString = element.getElementsByTagName('button')[0].getAttribute('style');

            const startIdx = backgroundImageString.indexOf('url(') + 5;
            const endIdx = backgroundImageString.indexOf('\')');

            let imageUrl = backgroundImageString.substring(startIdx, endIdx);
            imageUrl = imageUrl.replace("$_2", "$_57");
            ebayListing.images.push(imageUrl);
          });

          resolve();
        } else {
          setTimeout(checkImageElement, 1000); // wait for 1 second before checking again
        }
      }

      checkImageElement();
      
    });
  }
  
  await checkReadyState();
}

export async function copyDescription(ebayListing) {
  
  function checkReadyState() {
    return new Promise((resolve, reject) => {
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

  function retrieveDescription(listing) {
    return new Promise((resolve, reject) => {
      try{
        function checkDescElement() {
            let descElement = document.querySelector('div[data-testid="x-item-description-child"]');
            console.log('retrieveDescription');
            console.log(descElement); 
            if (descElement) {
              listing.description = descElement.innerText.trim();
            
              chrome.runtime.sendMessage({ action: 'descCopied', listing: listing});
              chrome.runtime.sendMessage({ action: 'updateDesc', desc: listing.desc, item: listing.itemNumber});
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