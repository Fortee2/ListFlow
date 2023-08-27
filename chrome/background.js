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
        let pageCount = 1;
        let totalPages = 0;

        do{
          const tab = await getActiveTab(url.url, pageCount, 'eBay');
          await delay(6000);
          const result = await new Promise(resolve => {
            chrome.scripting.executeScript({
              args:[url.activeListings],
              target: { tabId: tab.id },
              function: scrapDataEbay,
            }, resolve);
          });
          
          if(result[0].result) {
            console.log(result[0].result);
            if(pageCount === 1) {
              let itemCount = new Number(result[0].result.count.replace(',', ''));
              totalPages = Math.ceil(itemCount / 200);
            }
            pageCount++;

            
            if(result[0].result.result.length > 0) {
              saveItemToDatabase(result[0].result.result);
            }
          }
        }while(pageCount <= totalPages );
      }
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveMercari') {
    try {
      const urls = getMercariURLs();

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
        const pageCount = (itemCount < 20)? 1 :  Math.ceil(itemCount / 20);
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
            result[0].result.forEach(element => {
              titles.push(element)  
            });
          }
        }
        
        console.log('dump titles');
        console.log(titles);
        

        if(titles.length > 0) {
          downloadData(titles);
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
      const lis = document.querySelectorAll('li[data-testid="ListingRow"]');

      lis.forEach(f => {
        const ele = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelector('a'); 
        const divLike = f.querySelector('div[data-testid="RowItemWithLikes"]').querySelector('p');
        const divViews = f.querySelector('div[data-testid="RowItemWithViews"]').querySelector('p');
        const divLastUpdated = f.querySelector('div[data-testid="RowItemWithUpdated"]').querySelector('p'); 

        bulkData.push({ 
          itemTitle: ele.innerHTML,
          itemNumber: ele.href.split('/')[5],
          description: ele.innerHTML,
          salesChannel: 'Mercari',
          active: completedListings,
          likes: divLike.innerHTML,
          views: divViews.innerHTML,
          lastUpdated: divLastUpdated.innerHTML
         });
      });

      resolve(bulkData);
    });
  }

  await checkReadyState(); 
  return bulkData;
}

async function scrapDataEbay(activeListings) {
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
      
        if(activeListings){
          divDate = f.querySelector('td[class="shui-dt-column__scheduledStartDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]');
        }else{
          divDate = f.querySelector('td[class="shui-dt-column__actualEndDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]');
          endedStatus = f.querySelector('td[class="shui-dt-column__soldStatus "]').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
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
        
        bulkData.push({ 
          itemTitle: a.innerHTML,
          itemNumber: a.href.split('/')[4],
          description: a.innerHTML,
          salesChannel: 'eBay',
          active: activeListings,
          listingDate: parseEbayDate(dateContainer.innerHTML),
          listingDateType: listingType
         }); 
      });
      resolve();
    });
  }

  await checkReadyState();
  console.log(bulkData + '|' + itemCount );
  return  {'result': bulkData, 'count': itemCount};
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

function getMercariURLs() {
  const urls = [
    {'type': 'complete', 'url':'https://www.mercari.com/mypage/listings/complete/?page=', 'activeListings': false}, 
    {'type': 'active', 'url': 'https://www.mercari.com/mypage/listings/active/?page=', 'activeListings': true}, 
    {'type': 'inactive', 'url':'https://www.mercari.com/mypage/listings/inactive/?page=', 'activeListings': false}, 
    {'type':'inprogress','url':'https://www.mercari.com/mypage/listings/in_progress/?page=', 'activeListings': false}
  ];

  return urls;
}

function getEbayURLs() {
  const urls = [
    {'type': 'active', 'url': 'https://www.ebay.com/sh/lst/active', 'activeListings': true}, 
    {'type': 'inactive', 'url': 'https://www.ebay.com/sh/lst/ended', 'activeListings': false},
  ];  

  return urls;
}

function downloadData(data){
  console.log('downloadData');

  if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2); // Pretty print the JSON
  }

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
