export async function scrapDataEbay(activeListings) {
    let bulkData = [];
    let itemCount = 0;
  
    function checkReadyState() {
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
  
    function retrieveEbay(activeListings) {
      return new Promise((resolve, reject) => {
        console.log('retrieveEbay');
        console.log(`Listings are: ${activeListings}`);
  
        const trs = document.querySelectorAll('tr[class="grid-row"]');
      
        trs.forEach(f => {
          let div = f.querySelector('div[class="column-title__text"]');
          let divDate =  null;
          let endedStatus = 'Unsold';
          let views =  "0";
          let watchers = "0";
          let listPrice = "0";
          let imageUrl = "";
  
          if(activeListings){
            divDate = f.querySelector('td[class="shui-dt-column__scheduledStartDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]');
            views = f.querySelector('td[class="shui-dt-column__visitCount shui-dt--right"]').querySelector('button[class="fake-link"]').value;
            watchers = f.querySelector('td[class="shui-dt-column__watchCount shui-dt--right"').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
            listPrice = parseEbayPrice(f);
            imageUrl = f.querySelector('td[class="shui-dt-column__image shui-dt--left"]').querySelector('img').src;
          }else{
            divDate = f.querySelector('td[class="shui-dt-column__actualEndDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]');
            endedStatus = f.querySelector('td[class="shui-dt-column__soldStatus "]').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
            listPrice = f.querySelector('td[class="shui-dt-column__price shui-dt--right"]').querySelector('div[class="col-price__current"]').querySelector('span').innerHTML.replace('$', '').trim();
          }
    
          console.log(endedStatus);
  
          let listingType;
          if (activeListings) {
            listingType = 0;
          } else if (endedStatus === "Unsold") {
            listingType = 1;
          } else {
            listingType = 2;
          }
  
          let a = div.querySelector('a');
          let dateContainer = divDate.querySelector('div');
  
          console.log(parseEbayDate(dateContainer.innerHTML));
          console.log(`ListingType: ${listingType}`);
          
          if(imageUrl !== ""){
            chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: a.href.split('/')[4] + '.png'});
          }
          
          bulkData.push({ 
            itemTitle: a.innerHTML,
            itemNumber: a.href.split('/')[4],
            description: a.innerHTML,
            salesChannel: 'eBay',
            active: activeListings,
            listingDate: parseEbayDate(dateContainer.innerHTML),
            listingDateType: listingType,
            views: views,
            likes: watchers,
            price: listPrice
           }); 
        });
  
        chrome.runtime.sendMessage({ 
          action: 'saveToListingAPI',
          item: bulkData
        });
  
        resolve();
      });
    }

    function parseEbayPrice(priceElement) {
        try{
            return priceElement.querySelector('td[class="shui-dt-column__price shui-dt--right inline-editable"]').querySelector('div[class="col-price__current"]').querySelector('span').innerHTML.replace('$', '').trim();
        }
        catch(e){
            console.log(e);
            return "0";
        }
    }
  
    await checkReadyState();
    console.log(bulkData + '|' + itemCount );
    return  {'result': bulkData, 'count': itemCount};
  }