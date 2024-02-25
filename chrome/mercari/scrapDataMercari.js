export async function scrapData(completedListings, listingType, downloadImages) {
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
        let timePortion = dateString.split('ago')[0].trim();
      
        if (timePortion.includes('h')) {
          let hours = timePortion.split('h')[0].trim();
          let date = new Date();
          date.setHours(date.getHours() - hours);
          return date.toISOString();
        }
    
        if (timePortion.includes('d')) {  
          let days = timePortion.split('d')[0].trim();
          let date = new Date();
          date.setDate(date.getDate() - days);
          return date.toISOString();
        }
    
        if (timePortion.includes('m')) {
          let minutes = timePortion.split('m')[0].trim();
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
        const lis = document.querySelectorAll('li[data-testid="ListingRow"]');
  
        lis.forEach(f => {
          const ele = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelector('a'); 
          const itmNumber = ele.href.split('/')[5]
          let price; 
          const divLike = f.querySelector('div[data-testid="RowItemWithLikes"]').querySelector('p');
          const divViews = f.querySelector('div[data-testid="RowItemWithViews"]').querySelector('p');
          const divLastUpdated = f.querySelector('div[data-testid="RowItemWithUpdated"]').querySelector('p'); 
          let imageUrl = "";
            
          if(ele.innerHTML.startsWith('Bundle')) {
            return;
          }

          if(listingType === 'active') {
            price = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelector('input[name="price"]').value;
            imageUrl ='https://u-mercari-images.mercdn.net/photos/' + itmNumber + '_1.jpg?format=pjpg&auto=webp&fit=crop';
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
  
          if(imageUrl !== "" && downloadImages){
            chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: ele.href.split('/')[5] + '.png'});
          } 

          bulkData.push({ 
            itemTitle: ele.innerHTML,
            itemNumber: itmNumber,
            description: ele.innerHTML,
            salesChannel: 'Mercari',
            active: completedListings,
            likes: divLike.innerHTML,
            views: divViews.innerHTML,
            price: price,
            listingDate: parseDate(divLastUpdated.innerHTML),
            listingDateType: listingDateType,
            shipping: '',
            shippingCost: '',
            shippingService: '',
            shippingWeight: '',
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

export async function retrievePageCount(listingType, tab){
  const resultCnt = await new Promise(resolve => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: readTotalItems,
    }, resolve);
  });

  if(resultCnt[0].result) {
    let indx = 0;  //defaulting to Active

    switch(listingType) {
      case 'inactive':
        indx = 1;
        break;
      case 'inprogress':
        indx = 2;
        break;
      case 'complete':
        indx = 3;
        break;
    }

    let itemCount = +resultCnt[0].result[indx].replace(',', '');
    return Math.ceil(itemCount / 20);
  }

  return 0;
}

function readTotalItems() {
  console.log('readTotalItems');
  const div = document.querySelectorAll('h5[data-testid="FilterCount"]');
  let counts = [div[0].innerHTML , div[1].innerHTML, div[4].innerHTML, div[5].innerHTML];
  return counts;
}

