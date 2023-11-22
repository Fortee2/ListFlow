import { scrapDataEbay } from './scrapDataEbay.js';
import { scrapData, readTotalItems } from './scrapDataMercari.js';
import { getEbayURLs, searchMercariURLs } from './urls.js';

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if (request.action === 'retrieveEbay') {
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
  else if (request.action === 'retrieveNewMercari') {

    try {
      let pageCount = 1;
      let totalPages = 0;
      let titles = []; //Array to hold scraped data

      //Use Type to find the URL
      let url = searchMercariURLs(request.listingType);
      const activeListings = url[0].activeListings;

      do{
        //Load first Page
        const tab = await getActiveTab(url[0].url, pageCount, 'Mercari');
        await delay(getRandomInt(5000, 10000));

        if(totalPages === 0 ){
          const resultCnt = await new Promise(resolve => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: readTotalItems,
            }, resolve);
          });

          if(resultCnt[0].result) {
            console.log(resultCnt[0].result[0]);
            let itemCount = new Number(resultCnt[0].result[0].replace(',', ''));
            totalPages = Math.ceil(itemCount / 20);
          }
        }
        
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            args:[activeListings, url[0].type],
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
        pageCount++;
      }while(pageCount <= totalPages );
      //Loop through each page

      if(titles.length > 0) {
        downloadData(titles);
      }    
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'downloadImage') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: false,
      conflictAction: 'uniquify',
    });
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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}