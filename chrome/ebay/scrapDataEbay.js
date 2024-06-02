export async function scrapDataEbay(activeListings, downloadImages) {
    let bulkData = [];
    let itemCount = 0;
    
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
          divDate = parseEbayDateFromElement(f);
          views = parseEbayViewsFromElement(f);
          watchers = parseEbayWatchersFromElement(f);
          listPrice = parseEbayPrice(f);
          qty = parseAvailableQuantity(f);
        }else{
          divDate = f.querySelector('td[class="shui-dt-column__actualEndDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]').querySelectorAll('div')[0].innerHTML;
          endedStatus = parseEbayEndedStatus(f);
          listPrice = f.querySelector('td[class="shui-dt-column__price shui-dt--right"]').querySelector('div[class="col-price__current"]').querySelector('span').innerHTML.replace('$', '').trim();
        }

        let listingType;
        let listingDate = parseEbayDate(divDate);
        let a = div.querySelector('a');
        let itemNumber = a.href.split('/')[4];

        if (activeListings) {        
          listingType = 0;
        } else if (endedStatus === "Unsold") {
          listingType = 1;
        } else {
          listingType = 2;
        }

        bulkData.push({ 
          itemTitle: a.innerHTML,
          itemNumber: itemNumber,
          description: a.innerHTML,
          salesChannel: 'eBay',
          active: listStatus,
          listingDate: listingDate,
          listingDateType: listingType,
          views: views,
          likes: watchers,
          price: listPrice
        });  

        if(activeListings){
          //chrome.runtime.sendMessage({ action: 'downloadEbayDesc', itemNumber: a.href.split('/')[4]});
          chrome.runtime.sendMessage({ action: 'queueShippingInfo', itemNumber: a.href.split('/')[4]});

          if(downloadImages){
            chrome.runtime.sendMessage({ action: 'downloadEbayImage', itemNumber: a.href.split('/')[4]});           
          }  
        } 
      }
      
      chrome.runtime.sendMessage({ 
        action: 'saveToListingAPI',
        item: bulkData
      });
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
    
    function parseEbayDateFromElement(element) {
      try{
        const fromElement = element.querySelector('td[class="shui-dt-column__scheduledStartDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]').querySelectorAll('div')[0].innerHTML;
    
        return fromElement ? fromElement : "";
      }catch(e){
        console.log(e);
        return "";
      }
    }

    function parseEbayViewsFromElement(element) {
      try{
        const viewsElement = element.querySelector('td[class="shui-dt-column__visitCount shui-dt--right"]').querySelector('button[class="fake-link"]').value;
    
        return viewsElement ? viewsElement : "0";
      }catch(e){
        console.log(e);
        return "0";
      }
    }

    function parseEbayWatchersFromElement(element) {
      try{
        const watchersElement = element.querySelector('td[class="shui-dt-column__watchCount shui-dt--right"]').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
    
        return watchersElement ? watchersElement : "0";
      }catch(e){
        console.log(e);
        return "0";
      }
    }

    function parseEbayEndedStatus(element) {
      try{
        const endedStatusElement = element.querySelector('td[class="shui-dt-column__soldStatus "]').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
    
        return endedStatusElement ? endedStatusElement : "Unsold";
      }catch(e){
        console.log(e);
        return "Unsold";
      }
    }

    await checkReadyState();
    return  {'result': bulkData, 'count': itemCount};
  }

export async function scrapEbayImages(itemNumber, downloadImages) {
  
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
          //document.querySelectorAll('.uploader-thumbnails__inline-edit')[0].getElementsByTagName('button')[0].getAttribute('style')
          let imageElement = document.querySelectorAll('.uploader-thumbnails__inline-edit');
          if (imageElement) {
            let count = 0;
            imageElement.forEach((element) => {
              const backgroundImageString = element.getElementsByTagName('button')[0].getAttribute('style');

              const startIdx = backgroundImageString.indexOf('url(') + 5;
              const endIdx = backgroundImageString.indexOf('\')');

              console.log('retrieveImages');

              let imageUrl  = backgroundImageString.substring(startIdx, endIdx);
              chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: `${itemNumber}_${count}.png`});
              count++;
            });
            
            resolve();
        } else {
          setTimeout(checkImageElement, 1000); // wait for 1 second before checking again
        }
      }

      if(downloadImages){
        checkImageElement();
      }else{
        resolve();
      }
    });
  }

   await checkReadyState();
}

export async function scrapEbayDescriptions(itemNumber) {
  
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
          retrieveDescription(); 
          resolve();
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }
  
      check();
    });
    
  }

  function retrieveDescription() {
    return new Promise((resolve, reject) => {
      try{
        function checkDescElement() {
            let descElement = document.querySelector('div[data-testid="x-item-description-child"]');
            console.log('retrieveDescription');
            console.log(descElement); 
            if (descElement) {
              chrome.runtime.sendMessage({ action: 'updateDesc', desc: descElement.innerText, item: itemNumber});
              resolve();
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

  console.log('scrapEbayDescriptions');
  await checkReadyState();
}