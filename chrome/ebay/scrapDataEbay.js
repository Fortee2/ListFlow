export async function scrapDataEbay(activeListings, downloadImages) {
    let bulkData = [];
    let itemCount = 0;
    let zeroItemCount = 0;
  
    async function  checkReadyState() {
      return new Promise((resolve, reject) => {
        if(document.readyState === 'complete') {
          console.log('readyState is complete');
          readTotalItems();
          retrieveEbay(activeListings).then(resolve);
        }else{
          console.log('readyState is not complete');
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    } 
  
    function readTotalItems() {
      console.log('readTotalItems');
      const div = document.querySelector('span[class="result-range"]');
      itemCount = div.innerHTML.split('of')[1].trim();
      console.log(itemCount);
    }
  
    function parseEbayDate(dateString) {
      let testString = dateString.replace(' at ', ' ');
      let idx = testString.indexOf('am');
  
      if(idx === -1) {
        idx = testString.indexOf('pm');
      }
  
      testString = testString.substring(0, idx) +  ' ' + testString.substring(idx);; 
  
      let date = new Date(testString).toISOString();
  
      return date;
    }
  
   async function retrieveEbay(activeListings) {
      const trs = Array.from(document.querySelectorAll('tr[class="grid-row"]'));
      
      for(const f of trs) {
        let div = f.querySelector('div[class="column-title__text"]');
        let divDate =  null;
        let endedStatus = 'Unsold';
        let views =  "0";
        let watchers = "0";
        let listPrice;
        let qty = '1';
        let listStatus = activeListings;

        if(activeListings){
          divDate = f.querySelector('td[class="shui-dt-column__scheduledStartDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]').querySelectorAll('div')[0].innerHTML;
          views = f.querySelector('td[class="shui-dt-column__visitCount shui-dt--right"]').querySelector('button[class="fake-link"]').value;
          watchers = f.querySelector('td[class="shui-dt-column__watchCount shui-dt--right"').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
          listPrice = parseEbayPrice(f);
          qty = parseAvailableQuantity(f);
        }else{
          divDate = f.querySelector('td[class="shui-dt-column__actualEndDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]').querySelectorAll('div')[0].innerHTML;
          endedStatus = f.querySelector('td[class="shui-dt-column__soldStatus "]').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
          listPrice = f.querySelector('td[class="shui-dt-column__price shui-dt--right"]').querySelector('div[class="col-price__current"]').querySelector('span').innerHTML.replace('$', '').trim();
        }

        let listingType;
        let listingDate = parseEbayDate(divDate);
        let a = div.querySelector('a');
        let itemNumber = a.href.split('/')[4];

        if (activeListings) {
          if(qty == '0'){
            zeroItemCount++;
            f.querySelector(`input[id="shui-dt-checkone-${itemNumber}"]`).focus();
            f.querySelector(`input[id="shui-dt-checkone-${itemNumber}"]`).click();
            
            do{
              await delay(1000);
            }while(!f.querySelector(`input[id="shui-dt-checkone-${itemNumber}"]`).checked);

          }
          
          listingType = 0;
          
        } else if (endedStatus === "Unsold") {
          listingType = 1;
        } else {
          listingType = 2;
        }

        bulkData.push({ 
          itemTitle: a.innerHTML,
          itemNumber: a.href.split('/')[4],
          description: a.innerHTML,
          salesChannel: 'eBay',
          active: listStatus,
          listingDate: listingDate,
          listingDateType: listingType,
          views: views,
          likes: watchers,
          price: listPrice
          });  

        if(activeListings && downloadImages){
          chrome.runtime.sendMessage({ action: 'downloadEbayImage', itemNumber: a.href.split('/')[4]});           
        } 
      }

      if(zeroItemCount){
          let buttonClicked = false;
          let loopCount = 0;
          let endListingDiv = null;

          alert('stop');
                      
          do{
            
            await delay(3000);
            const actionButton = document.querySelectorAll('div[class="action-btn"]')[2].querySelector('button'); 
            
            if(actionButton && !buttonClicked){
              actionButton.focus();
              actionButton.click();
              buttonClicked = true;
            }

            if(buttonClicked){
              document.getElementById('s0-1-1-19-3-7-36-27-2-28-2-@bulkActionsV2-14-@fake-menu-@content-menu').querySelectorAll('li')[0].querySelector('button').click();
              endListingDiv = document.querySelector('div[class="se-end-listing__footer-actions"]');
              await delay(3000);
              if(endListingDiv != null){
                endListingDiv.querySelector('button[class="btn btn--primary"]').focus();
                endListingDiv.querySelector('button[class="btn btn--primary"]').click();
              }
            }
            
            loopCount++;
          }while(endListingDiv == null || loopCount < 10);
          
      }

      chrome.runtime.sendMessage({ 
        action: 'saveToListingAPI',
        item: bulkData
      });
    }

    async function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function parseEbayPrice(priceElement) {
        try{
            if(priceElement == null) return "0";

            let price = priceElement.querySelector('td[class="shui-dt-column__price shui-dt--right inline-editable"]').querySelector('div[class="col-price__current"]').querySelector('span').innerText;

            if(price.includes('to')){
                return price.split('to')[0].replace('$', '').trim();
            }
            
            return price.replace('$', '').trim();
        }
        catch(e){
            console.log(e);
            return "0";
        }
    }

    function parseAvailableQuantity(element) {
      try{
        const availableQuantityElement = element.querySelector(
            'td[class="shui-dt-column__availableQuantity shui-dt--right editable inline-editable"]'
        ).querySelector('div[class="shui-dt--text-column"]').querySelector('div');
    
        return availableQuantityElement ? availableQuantityElement.innerText : null;
      }catch(e){
        console.log(e);
        return "0";
      }

    }
  
    await checkReadyState();
    return  {'result': bulkData, 'count': itemCount};
  }

export async function scrapDataEbayImages(itemNumber) {
  function checkReadyState() {
    return new Promise((resolve, reject) => {
      if(document.readyState === 'complete') {
        retrieveImages().then(resolve);
      }else{
        setTimeout(() => checkReadyState().then(resolve), 1000);
      }
    });
  } 

  function retrieveImages() {
    return new Promise((resolve, reject) => {
      function checkImageElement() {
        let imageElement = document.querySelector('div[class="ux-image-carousel-item image-treatment active  image"]').querySelector('img');
        if (imageElement) {
          console.log('retrieveImages');
          let imageUrl = imageElement.src;
          chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: itemNumber + '.png'});
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