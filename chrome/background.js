import { scrapDataEbay, scrapDataEbayImages } from './scrapDataEbay.js';
import { scrapData, retrievePageCount, correctPriceMercari } from './scrapDataMercari.js';
import { searchEbayURLs, searchMercariURLs } from './urls.js';
import {mercariConstants} from './mercariConstants.js';

let queue = [];
let imageQueue = [];  // queue for image downloads
const priceChanges = new Map();

let isDownloading = false;
let isDownloadingImage = false;
let oldTab = [];

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

  if(request.action === 'retrieveSalesChannel') {
    try{
      let salesChannel = request.salesChannel;
      let listingType = request.listingType;
      let downloadImages = request.downloadImages;

      switch(salesChannel) {
        case 'Mercari':
          await retrieveNewMercariData(listingType, downloadImages);
          getMispricedItems().then(() => {
            correctPrice();
          });
          break;
        case 'eBay':
          await retrieveEbayData(listingType, downloadImages);
          break;
      }

    }catch(error) {
      console.error('Error executing script:', error);
    }
  }
  else if (request.action === 'downloadImage') {
    imageQueue.push({"url":request.url, "fileName":request.filename}); // enqueue the request
    processImageQueue(); // process the queue
  }
  else if (request.action === 'downloadEbayImage') {
    queue.push(request.itemNumber); // enqueue the request
  }
  else if (request.action === 'saveToListingAPI') {
    saveItemToDatabase(request.item);
  }
  else if (request.action === 'queuePriceChange') {
    console.log('queuePriceChange action received:', request.itemNumber, request.price);
    priceChanges.set(request.itemNumber, request.price);
  }
});

let tabId; // The ID of the tab you're interested in
let isChromeRunning = true;

chrome.windows.onRemoved.addListener(function() {
  // Stop calling correctPrice when the last Chrome window is closed
  isChromeRunning = false;
});

chrome.tabs.onRemoved.addListener(function(closedTabId) {
  if (closedTabId === tabId) {
    // The tab was closed, move to the next item
    correctPrice();
  }
});

async function correctPrice() {
  console.log('correctPrice');
  if(priceChanges.size > 0 && isChromeRunning){
    let keyValIterator = priceChanges.entries();
    let keyVal = keyValIterator.next().value;
    if (keyVal) {
      let url = mercariConstants.EditUrL + keyVal[0];
      let newPrice = keyVal[1];

      const tab = await loadTab(url);
      tabId = tab.id;

      await delay(getRandomInt(5000, 10000));

      chrome.scripting.executeScript({
          args: [newPrice],
          target: { tabId: tab.id },
          function: correctPriceMercari,
      }).then( () =>{
        console.log('Price Changed for ' + keyVal[0] + ' to ' + newPrice);
        delay(10000).then(() => {
          chrome.tabs.remove(tab.id);
        });
      }).catch((error) => {
        console.error('Error executing script:', error);
      });
      
      priceChanges.delete(keyVal[0]);
    }
  }
}

async function processImageQueue() {
  if (imageQueue.length === 0 || isDownloadingImage) {
    return;
  }

  isDownloadingImage = true;
  let imgRequest = imageQueue.shift(); // dequeue the request

  await new Promise((resolve) => {
    chrome.downloads.download({
      url: imgRequest.url,
      filename: imgRequest.fileName,
      saveAs: false,
      conflictAction: 'uniquify',
    }, () => {
      if(oldTab.length > 5){
        chrome.tabs.remove(oldTab.shift());
      }
      delay(getRandomInt(5000, 30000));
      resolve();
    });
  });

  isDownloadingImage = false;
  processImageQueue(); // recursively process the next request in the queue
}

async function processQueue() {
  if (queue.length === 0 || isDownloading) {
    return;
  }

  isDownloading = true;
  let itemNumber = queue.shift(); // dequeue the request

  delay(getRandomInt(5000, 30000));
  const tab = await loadTab('https://www.ebay.com/itm/' + itemNumber);

  await new Promise((resolve) => {
    chrome.scripting.executeScript({
      args: [itemNumber],
      target: { tabId: tab.id },
      function: scrapDataEbayImages,
    }, () => {
      oldTab.push(tab.id);
      resolve();
    });
  });

  isDownloading = false;
  processQueue(); // recursively process the next request in the queue
}

async function loadTab(targetUrl) {
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

    const response = await fetch('http://ec2-54-82-24-126.compute-1.amazonaws.com/api/BulkListing', {
    //const response = await fetch('https://localhost:7219/api/BulkListing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: item,
    });

    if (!response.ok) {
      //console.log('Item saved to the database successfully:', item);
    //} else {
      console.error('Failed to save item to the database:', item);
    }
  } catch (error) {
    console.error('Error saving item to the database:', error);
  }
}

function getMispricedItems() {
  return new Promise(resolve => {
    fetch(`https://localhost:7219/api/Listing/mispriced`).then(response => response.json()).then(data => {
        if(data.success  ){
          for(const item of data.data){
            if(item.itemNumber.startsWith('m')){
                priceChanges.set(item.itemNumber, item.crossPostPrice);
            }
          }
          resolve(); 
        }
    });

  });
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function retrieveEbayData(listingType, downloadImages) {
  try {
    const urls =  searchEbayURLs(listingType);

    for(const url of urls){
      let pageCount = 1;
      let totalPages = 0;

      do{
        const tab = await getActiveTab(url.url, pageCount, 'eBay');
        await delay(getRandomInt(5000, 30000));
        const result = await new Promise(resolve => {
          chrome.scripting.executeScript({
            args:[url.activeListings, downloadImages],
            target: { tabId: tab.id },
            function: scrapDataEbay,
          }, resolve);
        });
        
        if(result[0].result) {
          if(pageCount === 1) {
            let itemCount = new Number(result[0].result.count.replace(',', ''));
            totalPages = Math.ceil(itemCount / 200);
          }
          pageCount++;

        }
      }while(pageCount <= totalPages );

      processQueue(); // process the queue
      
    }
  } catch (error) {
    console.error('Error executing script:', error);
  }
}

async function retrieveNewMercariData(listingType, downloadImages) {
  try {
    let titles = []; //Array to hold scraped data

    //Use Type to find the URL
    let url = searchMercariURLs(listingType);
   
    for (const link of url) {
      const activeListings = link.activeListings;
      let totalPages = 0;
      let pageCount = 0;

      do {
        // Load first Page
        const tab = await getActiveTab(link.url, pageCount, 'Mercari');
        await delay(getRandomInt(3000, 5000));

        if (totalPages === 0) {
          totalPages = await retrievePageCount(link.type, tab);
        }

        await new Promise(resolve => {
          chrome.scripting.executeScript({
            args: [activeListings, link.type, downloadImages],
            target: { tabId: tab.id },
            function: scrapData,
          }, resolve);
        });

        pageCount++;
      } while (pageCount <= totalPages);
      // Loop through each page
    }

    if(titles.length > 0) {
      downloadData(titles);
    }    
  } catch (error) {
    console.error('Error executing script:', error);
  }
}