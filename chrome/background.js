chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'retrieveCount') {
    try {
      const tab = await getFirstTab('https://www.mercari.com/mypage/listings/active/');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function readTotalItems() {
          function checkReadyState() {
            if(document.readyState === 'complete') {
              console.log('readyState is complete');
              readTotalItems();
            }else{
              console.log('readyState is not complete');
              setTimeout(checkReadyState, 1000 );
            }
          }

          function readTotalItems() {
            console.log('readTotalItems');
            const div = document.querySelector('h5[data-testid="FilterCount"]');
            console.log(div.innerHTML); 
            chrome.runtime.sendMessage({ action: 'retrieveMercari', count: div.innerHTML, pageURL: 'https://www.mercari.com/mypage/listings/active/?page=' });
          }

          checkReadyState();
        }
      }
      );
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveCompletedCount') {
    try {
      const tab = await getFirstTab('https://www.mercari.com/mypage/listings/complete/');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function readTotalItems() {
          function checkReadyState() {
            if(document.readyState === 'complete') {
              console.log('readyState is complete');
              readTotalItems();
            }else{
              console.log('readyState is not complete');
              setTimeout(checkReadyState, 1000 );
            }
          }

          function readTotalItems() {
            console.log('readTotalItems');
            const div = document.querySelectorAll('h5[data-testid="FilterCount"]');
            console.log(div[5].innerHTML); 
            chrome.runtime.sendMessage({ action: 'retrieveMercari', count: div[5].innerHTML, pageURL: 'https://www.mercari.com/mypage/listings/complete/?page=' });
          }

          checkReadyState();
      }
    });
    } catch (error) {
      console.error('Error executing script:', error);
    }
    
  }
  else if (request.action === 'retrieveMercari') {
    try {
      const itemCount = request.count;
      const pageURL = request.pageURL;
      const pageCount = Math.ceil(itemCount / 20);
      console.log('pageCount: ' + pageCount);
      let titles = [];
  
      const pages = Array.from({length: pageCount}, (_, i) => i + 1);
      for (const page of pages) {
        const tab = await getActiveTab(pageURL, page);
        await delay(6000);
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: async function scrapData() {
              let data = [];
  
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
                    data.push(ele.innerHTML);
                  });

                  resolve(data);
                });
              }
  
              await checkReadyState(); 
              return data;
            },
          }, resolve);
        });
        
        if(result[0].result.length > 0) {
          titles.push(...result[0].result);
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

async function getActiveTab(targetUrl, page) {
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

        chrome.tabs.update(currTab.id, { url: targetUrl + page }, function(tab) {
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
