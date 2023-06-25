chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'retrieveCount') {
    try {
      const tab = await getFirstTab();
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
            chrome.runtime.sendMessage({ action: 'retrieveMercari', count: div.innerHTML });
          }

          checkReadyState();
        }
      }
      );
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'retrieveMercari') {
    try {
      const itemCount = request.count;
      const pageCount = Math.ceil(itemCount / 20);
      console.log('pageCount: ' + pageCount);
      let titles = [];
  
      for(let i = 1; i <= pageCount; i++) {
        const tab = await getActiveTab(i);
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: function scrapData() {
              let data = [];
  
              function checkReadyState() {
                if(document.readyState === 'complete') {
                  console.log('readyState is complete');
                  retrieveMercari();
                } else {
                  console.log('readyState is not complete');
                  setTimeout(checkReadyState, 1000 );
                }
              }
  
              function retrieveMercari() {
                console.log('retrieveMercari');
                const divs = document.querySelectorAll('div[data-testid="RowItemWithMeta"]');
  
                console.log(divs.length); 
  
                divs.forEach(f => {
                  const ele = f.querySelector('a'); 
                  data.push(ele.innerHTML);
                });
              }
  
              checkReadyState(); 
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

async function getFirstTab() {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: 'https://www.mercari.com/mypage/listings/active/' }, function(tab) {
      resolve(tab);
    });
  });
}

async function getActiveTab(page) {
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

        chrome.tabs.update(currTab.id, { url: 'https://www.mercari.com/mypage/listings/active/?page=' + page }, function(tab) {
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