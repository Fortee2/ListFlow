export async function scrapDataEtsy(completedListings, listingType) {
    let bulkData = [];
    let itemCount = 0;
  
    function checkReadyState() {
      return new Promise((resolve) => {
        if(document.readyState === 'complete') {
          console.log('readyState is complete');
          retrieveListings().then(data => resolve(data));
        } else {
          console.log('readyState is not complete');
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    }

    function readTotalItems() {
      return new Promise((resolve) => {
        console.log('readTotalItems');
        const btns = document.querySelector('div[data-region="pager"]').querySelectorAll('option');
        let counts = btns[btns.length -1].innerText;
        resolve(counts);
      });
    }
  
    function parseDate(div) {
      const text = div.trim();

      // Extract the date string
      const dateArray = text.split(' ');
      
      const dateString = dateArray[dateArray.length-3] + ' ' + dateArray[dateArray.length-2] + ' ' + dateArray[dateArray.length - 1];

      // Parse the date string into a Date object
      const date = new Date(dateString);

      // Return the adjusted date
      return date;
    }

    async function retrieveListings() {
        itemCount = await readTotalItems();
        const lis = document.querySelectorAll('div[class="panel-body-row"]');
  
        lis.forEach(f => {
          const itemLink = f.querySelector('div[class="listing-row-title wt-vertical-align-top flag-body"]').querySelector('a'); 
          console.log(itemLink.href);
          const itmNumber = itemLink.href.split('/')[8].split('?')[0];
          console.log(itmNumber);
          const divLastUpdated = f.querySelector('div.meta-listing-state').innerText;  
          console.log(divLastUpdated);
          console.log(parseDate(divLastUpdated));
          const price = f.querySelector('div[id="nondgp-price"]').innerText;
          let listingDateType;
  
          switch(listingType) {
            case 'active':
              listingDateType = 0;
              break;
            case 'inactive':
              listingDateType = 1;
              break;
            case 'inprogress':
            case 'complete':
              listingDateType = 2;
              break;
          }

          bulkData.push({ 
            itemTitle: itemLink.innerHTML,
            itemNumber: itmNumber,
            description: itemLink.innerHTML,
            salesChannel: 'Etsy',
            active: completedListings,
            likes: "0",
            views: "0",
            price: price,
            listingDate: parseDate(divLastUpdated),
            listingDateType: listingDateType
           });

        });
  
         chrome.runtime.sendMessage({ 
          action: 'saveToListingAPI',
          item: bulkData
        }); 

        return  {'result': bulkData, 'count': itemCount};
    }

    return checkReadyState();
    
  }