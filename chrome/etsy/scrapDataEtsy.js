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
        const btns = document.querySelector('div[data-region="pager"]').querySelectorAll('button');
        let counts = btns[btns.length -2].innerText;
        resolve(counts);
      });
    }
  
    function parseDate(div) {
      const text = div.textContent.trim();

      // Extract the date string
      const dateString = text.split(' ')[1] + ' ' + text.split(' ')[2];
      
      // Convert month name to month number
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthNumber = monthNames.indexOf(dateString.split(' ')[0]);

      // Construct a new date string with full month name
      const newDateString = dateString.replace(dateString.split(' ')[0], monthNumber + 1);

      // Parse the date string into a Date object
      const date = new Date(newDateString);

      // Subtract 4 months from the date
      date.setMonth(date.getMonth() - 4);

      // Return the adjusted date
      return date;
    }

    async function retrieveListings() {
        itemCount = await readTotalItems();
        const lis = document.querySelectorAll('div[class="panel-body-row"]');
  
        lis.forEach(f => {
          const itemLink = f.querySelector('div[class="listing-row-title vertical-align-top flag-body"]').querySelector('a'); 
          console.log(itemLink.href);
          const itmNumber = itemLink.href.split('/')[8].split('?')[0];
          console.log(itmNumber);
          const divLastUpdated = f.querySelector('div.meta-listing-state');  
          const price = f.querySelector('div[id="nondgp-price"]').querySelector('span[class="currency-value"]').innerText;
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