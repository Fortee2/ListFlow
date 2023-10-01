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
          await delay(getRandomInt(5000, 30000));
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
          await delay(getRandomInt(5000, 30000));
          const result = await new Promise(resolve => {
            chrome.scripting.executeScript({
              args:[activeListings, url.type],
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
  else if (request.action === 'saveToListingAPI') {
    saveItemToDatabase(request.item);
  }
});

async function getFirstTab(targetUrl) {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: targetUrl }, function(tab) {
      resolve(tab);
    });
  });
}

async function scrapData(completedListings, listingType) {
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

        if(listingType === 'active') {
          price = f.querySelector('div[data-testid="RowItemWithMeta"]').querySelector('input[name="price"]').value;
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
        let views =  "0";
        let watchers = "0";
        let listPrice = "0";

        if(activeListings){
          divDate = f.querySelector('td[class="shui-dt-column__scheduledStartDate shui-dt--left"]').querySelector('div[class="shui-dt--text-column"]');
          views = f.querySelector('td[class="shui-dt-column__visitCount shui-dt--right"]').querySelector('button[class="fake-link"]').value;
          watchers = f.querySelector('td[class="shui-dt-column__watchCount shui-dt--right"').querySelector('div[class="shui-dt--text-column"]').querySelector('div').innerHTML;
          listPrice = f.querySelector('td[class="shui-dt-column__price shui-dt--right inline-editable"]').querySelector('div[class="col-price__current"]').querySelector('span').innerHTML.replace('$', '').trim();
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
    {'type': 'inactive', 'url':'https://www.mercari.com/mypage/listings/inactive/?page=', 'activeListings': false}, 
    {'type': 'complete', 'url':'https://www.mercari.com/mypage/listings/complete/?page=', 'activeListings': false}, 
    {'type': 'active', 'url': 'https://www.mercari.com/mypage/listings/active/?page=', 'activeListings': true}, 
    {'type':'inprogress','url':'https://www.mercari.com/mypage/listings/in_progress/?page=', 'activeListings': false}
  ];

  return urls;
}

function getEbayURLs() {
  const urls = [
   // {'type': 'active', 'url': 'https://www.ebay.com/sh/lst/active', 'activeListings': true}, 
    {'type': 'inactive', 'url': 'https://www.ebay.com/sh/lst/ended', 'activeListings': false},
  ];  

  return urls;
}

function downloadData(data) {
  console.log('downloadData');

  if (Array.isArray(data) && data.length > 0) {
      let csvContent = '';

      // Header row
      const header = Object.keys(data[0]).join(',');
      csvContent += header + '\n';

      // Data rows
      data.forEach(row => {
          const rowData = Object.values(row).join(',');
          csvContent += rowData + '\n';
      });

      data = csvContent;
  }

  const blob = new Blob([data], { type: 'text/csv' });

  const reader = new FileReader();
  reader.onloadend = function() {
      const base64data = reader.result;
      chrome.downloads.download({
          url: base64data,
          filename: 'data.csv'
      });
  }
  reader.readAsDataURL(blob);
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function saveItemToDatabase(item) {
  try {
    if (typeof item === 'object') {
      item = JSON.stringify(item, null, 2); // Pretty print the JSON
    }

    console.log('Saving item to the database:', item);
    
    const response = await fetch('https://localhost:7219/api/BulkListing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: item,
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}