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

  function parseListings() {
    return new Promise((resolve, reject) => {
      try {
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

        resolve(bulkData);
      } catch (error) {
        reject(error);
      }
    });
  }

  await checkReadyState(); 
  return bulkData;
}
