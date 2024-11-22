export async function getActiveTab(targetUrl, page, salesChannel, activeListings = true) {
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
  
          if(salesChannel === "Mercari") {
            updatedURL = targetUrl + page;
          } else if(salesChannel === "eBay") {
            let offset = (page - 1) * 200;
            let qs = (activeListings)? "?" : "&";
            updatedURL = targetUrl + qs + "offset=" + offset +  "&limit=200&sort=availableQuantity";
          }
  
          chrome.tabs.update(currTab.id, { url: updatedURL }, function() {
            resolve(currTab);
          });
        } else {
          console.error("No focused window found.");
        }
      });
    });
  }

 export async function loadTab(targetUrl) {
    return new Promise((resolve) => {
      chrome.tabs.create({ url: targetUrl }, function(tab) {
        resolve(tab);
      });
    });
  }