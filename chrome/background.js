chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'retrieveCount') {
    try {
      const tab = await getFirstTab('https://www.mercari.com/mypage/listings/active/');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['retrieveCount.js'],
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveEbay') {
    try {
      const urls =  getEbayURLs();

      for(const url of urls){
        const tab = await getActiveTab(url.url, 1, 'eBay');
        await delay(6000);
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            args:[url.activeListings],
            target: { tabId: tab.id },
            function: scrapDataEbay,
          }, resolve);
        });
        
        if(result[0].result) {
          saveItemToDatabase(result[0].result);
        }
      }
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveMercari') {
    try {
      const urls = [
        {'type': 'complete', 'url':'https://www.mercari.com/mypage/listings/complete/?page=', 'activeListings': false}, 
        {'type': 'active', 'url': 'https://www.mercari.com/mypage/listings/active/?page=', 'activeListings': true}, 
        {'type': 'inactive', 'url':'https://www.mercari.com/mypage/listings/inactive/?page=', 'activeListings': false},
        {'type':'inprogress','url':'https://www.mercari.com/mypage/listings/in_progress/?page=', 'activeListings': false}
      ];

      for (const url of urls) {
        let titles = [];
        let itemCount = 0;

        switch(url.type) {
          case 'complete':
            itemCount = request.countData[3];
            break;
          case 'active':
            itemCount = request.countData[0];
            break;
          case 'inactive':
            itemCount = request.countData[1];
            break;
          case 'inprogress':
            itemCount = request.countData[2];
            break;
        }

        const pageURL = url.url;
        const activeListings = url.activeListings;
        const pageCount =  (itemCount < 20)? 1 :  Math.ceil(itemCount / 20);
        console.log('pageCount: ' + pageCount);
  
        const pages = Array.from({length: pageCount}, (_, i) => i + 1);
        
        for (const page of pages) {
          const tab = await getActiveTab(pageURL, page, 'Mercari');
          await delay(6000);
          const result = await new Promise(resolve => {
            chrome.scripting.executeScript({
              args:[activeListings],
              target: { tabId: tab.id },
              function: scrapData,
            }, resolve);
          });
          
          if(result[0].result) {
            saveItemToDatabase(result[0].result);
          }
        }
    
        if(titles.length > 0) {
          downloadData(titles.join('\n') );
        }
      }
  
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
});

async function getFirstTab(targetUrl) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: targetUrl }, function(tab) {
      resolve(tab);
    });
  });
}

async function scrapData(completedListings) {
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

  function retrieveMercari() {
    return new Promise((resolve, reject) => {
      console.log('retrieveMercari');
      const divs = document.querySelectorAll('div[data-testid="RowItemWithMeta"]');

      divs.forEach(f => {
        const ele = f.querySelector('a'); 
       
        bulkData.push({ 
          itemTitle: ele.innerHTML,
          itemNumber: ele.href.split('/')[5],
          description: ele.innerHTML,
          salesChannel: 'Mercari',
          active: completedListings,
         });
      });

      resolve(bulkData);
    });
  }

  await checkReadyState(); 
  return bulkData;
}

async function scrapDataEbay(completedListings) {
  let bulkData = [];
 
   function checkReadyState() {
    return new Promise((resolve, reject) => {
      if(document.readyState === 'complete') {
        console.log('readyState is complete');
        retrieveEbay().then(resolve);
      }else{
        console.log('readyState is not complete');
        setTimeout(() => checkReadyState().then(resolve), 1000);
      }
    });
  } 

  function retrieveEbay() {
    return new Promise((resolve, reject) => {
      console.log('retrieveEbay');
      const trs = document.querySelectorAll('tr[class="grid-row"]');
    
      trs.forEach(f => {
        let div = f.querySelector('div[class="column-title__text"]');
        let a = div.querySelector('a');
        console.log(a.innerHTML + '|' + a.href.split('/')[4]);
   
        bulkData.push({ 
          itemTitle: a.innerHTML,
          itemNumber: a.href.split('/')[4],
          description: a.innerHTML,
          salesChannel: 'eBay',
          active: completedListings,
         }); 
      });

      resolve(bulkData);
    });
  }

  await checkReadyState();
  return bulkData;
}

async function getActiveTab(targetUrl, page, salesChannel, activeListings = true) {
  return new Promise((resolve) => {
    
    chrome.windows.getLastFocused({ populate: true }, (focusedWindow) => {
      let currTab= null;
      if (focusedWindow) {
        const activeTab = focusedWindow.tabs.find((tab) => tab.active);
        if (activeTab) {
          currTab = activeTab;
        } else {
          currTab = focusedWindow.tabs[0];
        }

        let updatedURL = targetUrl;

        if(salesChannel === 'Mercari') {
          updatedURL = targetUrl + page;
        } else if(salesChannel === 'eBay') {
          let offset = (page - 1) * 200;
          let qs = (activeListings)? '?' : '&';
          updatedURL = targetUrl + qs + 'offset=' + offset +  '&limit=200&sort=availableQuantity';
        }

        chrome.tabs.update(currTab.id, { url: updatedURL }, function(tab) {
          resolve(currTab);
        });
      } else {
        console.error("No focused window found.");
      }
    });
  });
}

function getEbayURLs() {
  const urls = [
    {'type': 'active', 'url': 'https://www.ebay.com/sh/lst/active', 'activeListings': true},  
    {'type': 'unsold', 'url': 'https://www.ebay.com/sh/lst/ended?status=UNSOLD&catType=storeCategories&timePeriod=LAST_90_DAYS&q_field1=title&action=search', 'activeListings': false},
    {'type': 'sold', 'url': 'https://www.ebay.com/sh/lst/ended?status=SOLD&catType=storeCategories&timePeriod=LAST_90_DAYS&q_field1=title&action=search', 'activeListings': true},
  ];  

  return urls;
}

function downloadData(data){
  const blob = new Blob([data], { type: 'text/plain' });
  
  const reader = new FileReader();
  reader.onloadend = function() {
    const base64data = reader.result;
    chrome.downloads.download({
      url: base64data,
      filename: 'data.txt'
    });
  }
  reader.readAsDataURL(blob);
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function saveItemToDatabase(item) {
  try {
    console.log('Saving item to the database:', item);
    
    const response = await fetch('https://localhost:7219/api/BulkListing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });

    if (response.ok) {
      console.log('Item saved to the database successfully:', item);
    } else {
      console.error('Failed to save item to the database:', item);
    }
  } catch (error) {
    console.error('Error saving item to the database:', error);
  }
}


function retrieveEbayCounts (document){
  function checkReadyState() {
    if(document.readyState === 'complete') {
      console.log('readyState is complete');
      return readTotalItems();
    }else{
      console.log('readyState is not complete');
      setTimeout(checkReadyState, 1000 );
    }
  }

  function readTotalItems() {
    console.log('readTotalItems');
    const div = document.querySelector('span[class="result-range"]');
    console.log(div.innerHTML); 
    let count = div.innerHTML.split('of')[1].trim();
    console.log(count);
    return count;
  }

  return checkReadyState();
}