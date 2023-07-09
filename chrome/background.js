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
  else if (request.action === 'retrieveEbayCount') {
    try {
      const tab = await getFirstTab('https://www.ebay.com/sh/lst/active');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['retrieveEbayCount.js'],
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveCompletedCount') {
    try {
      const tab = await getFirstTab('https://www.mercari.com/mypage/listings/complete/');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['retrieveCompletedCount.js'],
    });
    } catch (error) {
      console.error('Error executing script:', error);
    }
    
  }
  else if (request.action === 'retrieveEbay') {
    try {
      const itemCount = request.count;
      const pageURL = request.pageURL;
      const pageCount =  (itemCount < 200)? 1 :  Math.ceil(itemCount / 200);
      console.log('pageCount: ' + pageCount);
      let titles = [];

      const pages = Array.from({length: pageCount}, (_, i) => i + 1);
      for (const page of pages) {
        const tab = await getActiveTab(pageURL, page, 'eBay');
        await delay(6000);
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: async function scrapData() {
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
                     }); 
                  });

                  resolve(bulkData);
                });
              }

              await checkReadyState();
              return bulkData;
            },
          }, resolve);
        });
 
        if(result[0].result) {
          saveItemToDatabase(result[0].result);
        }
      }

      if(titles.length > 0) {
        downloadData(titles.join('\n') );
      }

    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveMercari') {
    try {
      const itemCount = request.count;
      const pageURL = request.pageURL;
      const pageCount =  (itemCount < 20)? 1 :  Math.ceil(itemCount / 20);
      console.log('pageCount: ' + pageCount);
      let titles = [];
  
      const pages = Array.from({length: pageCount}, (_, i) => i + 1);

      for (const page of pages) {
        const tab = await getActiveTab(pageURL, page, 'Mercari');
        await delay(6000);
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: async function scrapData() {
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
                     });
                  });

                  resolve(bulkData);
                });
              }
  
              await checkReadyState(); 
              return bulkData;
            },
          }, resolve);
        });
        
        if(result[0].result) {
          saveItemToDatabase(result[0].result);
        }
      }
  
      if(titles.length > 0) {
        downloadData(titles.join('\n') );
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

async function getActiveTab(targetUrl, page, salesChannel) {
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
          updatedURL = targetUrl + '?offset=' + offset +  '&limit=200&sort=availableQuantity';
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
