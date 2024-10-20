export async function scrapPoshmarkData() {
  let bulkData = [];

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
          parseListings().then(resolve).catch((error) => console.log(error)); 
          resolve();
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }
  
      check();
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



  function parseListings() {
    return new Promise((resolve, reject) => {
      try {
        alert('parseListings');
        const items = document.querySelectorAll('pre')[0].innerText;
        const data = JSON.parse(items);

        for (let i = 0; i < data.data.length; i++) {
          let item = data.data[i];



          var itm = {  
            itemTitle: item.title,
            itemNumber: item.id,
            description: item.description,
            salesChannel: 'Poshmark',
            active: (item.inventory.status === 'available') ? true : false,
            listingDate: (item.inventory.status === 'available') ? item.created_at : item.inventory.status_changed_at,
            listingDateType: (item.inventory.status === 'available') ? 0 : (item.inventory.size_quantities[0].quantity_sold == 0) ? 1 : 2,
            views: "0",
            likes: "0",
            price: item.price_amount.val
          };  

          chrome.runtime.sendMessage({ 
            action: 'saveToListingAPI',
            item: [itm]
          });
          console.log('itm', itm);
          bulkData.push(itm);
        }

        //console.log('bulkData', bulkData);
        resolve(bulkData);
      } catch (error) {
        reject(error);
      }
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
const div = document.querySelectorAll('p[data-testid="FilterCount"]');
let counts = [div[0].innerHTML , div[1].innerHTML, div[4].innerHTML, div[5].innerHTML];
return counts;
}