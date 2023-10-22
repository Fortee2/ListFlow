export async function scrapData(completedListings, listingType) {
    let bulkData = [];
  
    function checkReadyState() {
      return new Promise((resolve, reject) => {
        if(document.readyState === 'complete') {
          console.log('readyState is complete');
          retrieveMercari().then(resolve);
        } else {
          console.log('readyState is not complete');
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    }
  
    function parseDate(dateString) {
      if (dateString.includes('ago')) {
        let timeportion = dateString.split('ago')[0].trim();
        console.log(timeportion);
  
        if (timeportion.includes('h')) {
          let hours = timeportion.split('h')[0].trim();
          let date = new Date();
          date.setHours(date.getHours() - hours);
          return date.toISOString();
        }
  
        if (timeportion.includes('d')) {  
          let days = timeportion.split('d')[0].trim();
          let date = new Date();
          date.setDate(date.getDate() - days);
          return date.toISOString();
        }
  
        if (timeportion.includes('m')) {
          let minutes = timeportion.split('m')[0].trim();
          let date = new Date();
          date.setMinutes(date.getMinutes() - minutes);
          return date.toISOString();
        }
  
        console.log('Unable to parse date');
        return null;
      }
  
      return new Date(dateString).toISOString();
    }
  
    function retrieveMercari() {
      return new Promise((resolve, reject) => {
        console.log('retrieveMercari');
        const lis = document.querySelectorAll('li[data-testid="ListingRow"]');
  
        lis.forEach(f => {
          const ele = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelector('a'); 
          let price; 
          const divLike = f.querySelector('div[data-testid="RowItemWithLikes"]').querySelector('p');
          const divViews = f.querySelector('div[data-testid="RowItemWithViews"]').querySelector('p');
          const divLastUpdated = f.querySelector('div[data-testid="RowItemWithUpdated"]').querySelector('p'); 
          let imageUrl = "";
            
          if(listingType === 'active') {
            price = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelector('input[name="price"]').value;
            imageUrl = f.querySelector('div[data-testid="StyledProductThumb"]').querySelector('img').src;
          } else {
            price = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelectorAll('a')[1].innerHTML.replace('$', '').trim();
          }
  
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
  
          if(imageUrl !== ""){
            chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: ele.href.split('/')[5] + '.png'});
          }

          bulkData.push({ 
            itemTitle: ele.innerHTML,
            itemNumber: ele.href.split('/')[5],
            description: ele.innerHTML,
            salesChannel: 'Mercari',
            active: completedListings,
            likes: divLike.innerHTML,
            views: divViews.innerHTML,
            price: price,
            listingDate: parseDate(divLastUpdated.innerHTML),
            listingDateType: listingDateType
           });
        });
  
        chrome.runtime.sendMessage({ 
          action: 'saveToListingAPI',
          item: bulkData
        });
  
        resolve(bulkData);
      });
    }
  
    await checkReadyState(); 
    return bulkData;
  }