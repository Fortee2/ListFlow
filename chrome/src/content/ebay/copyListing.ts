import IListing from "../../domain/IListing";

export async function copyEbayListing(itemNumber: string): Promise<void> {
  function checkReadyState() {
    return new Promise<void>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
      let errorChecked = false;

      // Check for error page immediately and during navigation
      function checkForErrorPage() {
        if (!errorChecked 
              && 
            (
              window.location.href.includes('ebay.com/lstng/error') 
              || window.document.body.innerText.includes('You are not allowed to revise ended listings.')
            )
           ) 
        {
          errorChecked = true;
          console.log('On error page, setting item inactive');
          
          // Retry the message send a few times if needed
          let retries = 3;
          function sendInactiveMessage() {
            chrome.runtime.sendMessage({
              action: 'SetInactive',
              itemNumber: itemNumber
            });
          }
          sendInactiveMessage();
          
          clearTimeout(timeoutId);
          reject(new Error('Item not found - redirected to error page'));
          return true;
        }
        return false;
      }

      // Listen for URL changes
      const observer = new MutationObserver(() => {
        if (checkForErrorPage()) {
          observer.disconnect();
        }
      });
      observer.observe(document, { subtree: true, childList: true });

      // Initial check
      if (checkForErrorPage()) {
        observer.disconnect();
        return;
      }

      timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error('Page load timed out after 10 seconds'));
      }, 10000);

      function check() {
        if (document.readyState === 'complete') {
          observer.disconnect();
          clearTimeout(timeoutId);
          console.log('readyState is complete');
          
          if (checkForErrorPage()) {
            return;
          }
          
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
      try {
        // Verify essential elements exist before proceeding
        const requiredElements = [
          { name: 'title', selector: 'input[name="title"]' },
          { name: 'price', selector: 'input[name="price"]' },
          { name: 'majorWeight', selector: 'input[name="majorWeight"]' },
          { name: 'minorWeight', selector: 'input[name="minorWeight"]' },
          { name: 'packageLength', selector: 'input[name="packageLength"]' },
          { name: 'packageWidth', selector: 'input[name="packageWidth"]' },
          { name: 'packageDepth', selector: 'input[name="packageDepth"]' }
        ];

        const missingElements = requiredElements.filter(el => !document.querySelector(el.selector));
        
        if (missingElements.length > 0) {
          alert(itemNumber );
          chrome.runtime.sendMessage({
            action: 'SetInactive',
            itemNumber: itemNumber
          });
         
          reject(new Error(`Missing required elements on the page: ${missingElements.map(el => el.name).join(', ')}`));
        }


        let listing: IListing = {
          id: '',
          active: true,
          salesChannelId: '',
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
        checkPostageElement(listing)
          //.then(() => retrieveImages(listing))
          .then(() => {
            chrome.runtime.sendMessage({ action: 'listingCopied', listing: listing});
            resolve();
          })
          .catch(error => {
            console.error('Error processing listing:', error);
            reject(error);
          });
      }catch(e){
        console.log(e);
        reject(e as Error);   
      }
    });
  }

  function checkPostageElement(ebayListing: IListing): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let majorElement = document.querySelector('input[name="majorWeight"]') as HTMLInputElement;
        let minorElement = document.querySelector('input[name="minorWeight"]') as HTMLInputElement;
        let packageLength = document.querySelector('input[name="packageLength"]') as HTMLInputElement;
        let packageWidth = document.querySelector('input[name="packageWidth"]') as HTMLInputElement;
        let packageHeight = document.querySelector('input[name="packageDepth"]') as HTMLInputElement;
        let title = document.querySelector('input[name="title"]') as HTMLInputElement;
        let price = document.querySelector('input[name="price"]') as HTMLInputElement;

        if (!majorElement || !minorElement || !packageLength || !packageWidth || !packageHeight || !title || !price) {
          reject(new Error('Required postage elements not found on page'));
          return;
        }

        ebayListing.itemTitle = title.value;
        ebayListing.price = price.value;  
        ebayListing.shipping.majorWeight = majorElement.value === '' ? 0 : parseInt(majorElement.value);
        ebayListing.shipping.minorWeight = minorElement.value === '' ? 0 : parseInt(minorElement.value);
        ebayListing.shipping.packageLength = packageLength.value === '' ? 0 : parseInt(packageLength.value);
        ebayListing.shipping.packageWidth = packageWidth.value === '' ? 0 : parseInt(packageWidth.value);
        ebayListing.shipping.packageHeight = packageHeight.value === '' ? 0 : parseInt(packageHeight.value);

        console.log('retrievePostage');
        chrome.runtime.sendMessage({ 
          action: 'queueEbayPostage', 
          majorElement: majorElement.value === '' ? 0 : majorElement.value, 
          minorElement: minorElement.value === '' ? 0 : minorElement.value,
          packageLength: packageLength.value === '' ? 0 : packageLength.value,
          packageWidth: packageWidth.value === '' ? 0 : packageWidth.value,
          packageHeight: packageHeight.value === '' ? 0 : packageHeight.value,
          item: itemNumber
        });
        resolve();
      } catch(e) {
        console.error('Error in checkPostageElement:', e);
        reject(e);
      }
    });
  }

  function retrieveImages(ebayListing: IListing): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let attempts = 0;
        const maxAttempts = 10; // Try for 10 seconds max

        function checkImageElement() {
          console.log('Checking for image elements');
          let imageElements = document.querySelectorAll('.uploader-thumbnails-ux__thumbnail');
          
          if (imageElements.length > 0) {
            console.log(`Found ${imageElements.length} images`);
            imageElements.forEach((element) => {
              const backgroundImageString = element.getElementsByTagName('button')[0].getAttribute('style') as string;
              let imageName = element.getElementsByTagName('button')[0].getAttribute('aria-label') as string;
              let imageTitleWords = imageName.split(' ');
              let imageOrder = imageTitleWords[imageTitleWords.length - 1]; 
              const startIdx = backgroundImageString.indexOf('url(') + 4;
              const endIdx = backgroundImageString.indexOf(')');

              let imageUrl = backgroundImageString.substring(startIdx, endIdx);
              imageUrl = imageUrl.replace('_2', '_57');
              console.log(imageUrl);

              let titleFolderName = extractTitle();
              chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: `${itemNumber}_${imageOrder}.jpg`, folderName: titleFolderName });
            });

            resolve();
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error('Timed out waiting for image elements to load'));
              return;
            }
            setTimeout(checkImageElement, 1000);
          }
        }
        
        checkImageElement();
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  function extractTitle(): string {
    let div = document.querySelector('input[name="title"]');
    console.log(div);
    if (div) {
      let itemTitle = div.getAttribute('value') as string;
      console.log(itemTitle);
      itemTitle = itemTitle?.replace(/[^a-zA-Z0-9]/g, '_');
      itemTitle = itemTitle?.replace(/_+/g, '_');
      return itemTitle;
    }

    return '';
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
      try {
        let attempts = 0;
        const maxAttempts = 10; // Try for 10 seconds max

        function checkDescElement() {
          let descElement = document.querySelector('div[data-testid="x-item-description-child"]');
          console.log('retrieveDescription');
          console.log(descElement); 
          
          if (descElement) {
            listing.description = descElement.textContent?.trim() || '';
            if (!listing.description) {
              reject(new Error('Description element found but content is empty'));
              return;
            }
            
            chrome.runtime.sendMessage({ action: 'descCopied', listing: listing});
            chrome.runtime.sendMessage({ action: 'updateDesc', desc: listing.description, item: listing.itemNumber});
            resolve(ebayListing);
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              reject(new Error('Timed out waiting for description element to load'));
              return;
            }
            setTimeout(checkDescElement, 1000);
          }
        }
        
        checkDescElement();
      } catch(e) {
        console.error('Error in retrieveDescription:', e);
        reject(e);   
      }
    });
  }

  console.log('copyEbayDescriptions');
  await checkReadyState();
}
