export async function getActiveTab(targetUrl:string, page: number, salesChannel: string, activeListings = true) : Promise<chrome.tabs.Tab> {
  return new Promise((resolve) => {
    
    chrome.windows.getLastFocused({ populate: true }, (focusedWindow) => {
      let currTab: chrome.tabs.Tab | null = null;
      if (focusedWindow) {
        const activeTab = focusedWindow.tabs?.find((tab) => tab.active);
        if (activeTab ) {
          currTab = activeTab;
        } else {
          console.error("No focused window found.");
          return;
        }

        let updatedURL = targetUrl;

        if(salesChannel === "Mercari") {
          updatedURL = targetUrl + page;
        } else if(salesChannel === "eBay") {
          let offset = (page - 1) * 200;
          let qs = (activeListings)? "?" : "&";
          updatedURL = targetUrl + qs + "offset=" + offset +  "&limit=200&sort=availableQuantity";
        }

        chrome.tabs.update(currTab.id as number, { url: updatedURL }, function() {
          resolve(currTab);
        });
      } else {
        console.error("No focused window found.");
      }
    });
  });
}

export async function loadTab(targetUrl: string) : Promise<chrome.tabs.Tab> {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: targetUrl }, function(tab) {
      resolve(tab);
    });
  });
}