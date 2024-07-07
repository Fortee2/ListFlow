export async function scrapDataEbay(activeListings, downloadImages, lastTimeInactive) {
    let bulkData = [];
    let itemCount = 0;
    
    async function  checkReadyState() {
      return new Promise((resolve, reject) => {
        let timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error('Page load timed out after 10 seconds'));
        }, 10000); // 10 seconds timeout
    
        function check() {
          if(document.readyState === 'complete') {
            clearTimeout(timeoutId);
            console.log('readyState is complete');
            readTotalItems().then(retrieveEbay(activeListings, lastTimeInactive).then(resolve( {'result': bulkData, 'count': itemCount})));
            resolve();
          } else {
            console.log('readyState is not complete');
            setTimeout(check, 1000);
          }
        }
    
        check();
      });
    } 
  
    function readTotalItems() {
      return new Promise((resolve) => {
        console.log('readTotalItems');
        const div = document.querySelector('span[class="result-range"]');
        itemCount = div.innerHTML.split('of')[1].trim();
        console.log(itemCount);
        resolve(itemCount);
      });
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
  
   async function retrieveEbay(activeListings, lastTimeInactive) {
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
        } else {
          let endDate = new Date(listingDate);
          let lastInactive = new Date(lastTimeInactive);

          //We have already processed this item
          if (endDate < lastInactive) {
            continue;
          }

          if (endedStatus === "Unsold") {
            listingType = 1;
          } else {
            listingType = 2;
          }
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

    return checkReadyState();
  }



