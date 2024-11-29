import { scrapDataEbay } from "./functions/ebay/scrapDataEbay.js";
import { scrapEbayImages } from "./functions/ebay/scrapImages.js";
import { scrapEbayDescriptions } from "./functions/ebay/scrapDescription.js";
import { scrapEbayPostage } from "./functions/ebay/postage.js";
import { scrapData, retrievePageCount } from "./functions/mercari/scrapDataMercari.js";
import { searchEbayURLs, searchMercariURLs, searchEtsyURLs, getMercariItemURL } from './utils/urls.js';
import {mercariConstants} from "./functions/mercari/mercariConstants.js";
import { retrieveItemDetails } from "./functions/mercari/itemPageDetails.js";
import { scrapDataEtsy } from "./functions/etsy/scrapDataEtsy.js";
import { endEbayListings } from "./functions/ebay/endListings.js";
import { removeInactive } from "./functions/mercari/removeInactive.js";
import { getRandomInt, delay } from "./utils/utils.js";
import { getActiveTab, loadTab } from "./utils/tabs.js";
import { createMercariListing } from "./functions/mercari/createMercariListing.js";
import { copyDescription, copyEbayListing } from "./functions/ebay/copyListing.js";
import { createDistrictListing } from "./functions/district/createDistrictListing.js";
import ImgRequest from "./domain/imgRequest.js";
import OnInstall from "./events/onInstall.js";
import PostageRequest from "./domain/postageRequest.js";

let ebayImageQueue: ImgRequest[] = [];
let descQueue:string[] = [];  // queue for description updates
let postageQueue:PostageRequest[] = [];  // queue for postage updates
let shippingInfoQueue:string[] = [];  // queue for shipping info updates
let currentSalesChannel = '';
let createExport = false;
let zeroQtyQueue:string[] = [];
let downloadImages = false;

const priceChanges = new Map();

let isDownloading = false;
let copyToSalesChannel = '';
let oldTab: number[] = [];
let serverURI = "http://demo.api.com";
let lastTimeInactive = "2024-01-01";
let removeInactiveListings = false;

chrome.runtime.onInstalled.addListener(() => {
  let installer = new OnInstall(chrome);
  installer.create();
});

// Load settings when the extension is loaded
chrome.storage.sync.get({
 serverURI: "http://demo.api.com",
 createExport: false,
 removeInactiveListings: false,
 lastTimeInactive: "2024-01-01",
}, function(data) {
 serverURI = data.serverURI;
 createExport = data.createExport;
 removeInactiveListings = data.removeInactiveListings;
 lastTimeInactive = data.lastTimeInactive;
});

chrome.runtime.onMessage.addListener(async (request) => {
 console.log("Received message:", request.action);
 switch(request.action) {
   case "downloadEbayImage":
     ebayImageQueue.push(request.itemNumber); // enqueue the request
     processQueue(); // process the queue
     break;
   case "downloadEbayDesc":
     descQueue.push(request.itemNumber); // enqueue the request
     break;
   case "saveToListingAPI":
     saveItemToDatabase(request.item);
     break;
   case "queueEbayNoQty":
     zeroQtyQueue.push(request.itemNumber);
     break;
   case "queueShippingInfo":
     shippingInfoQueue.push(request.itemNumber);
     break;
   case "queueEbayPostage":
     postageQueue.push({
       "majorElement": request.majorElement,
       "minorElement": request.minorElement,
       "packageLength": request.packageLength,
       "packageWidth": request.packageWidth,
       "packageHeight": request.packageHeight,
       "itemNumber": request.item
     });
     processPostageQueue(); // process the queue
     break;
   case "downloadData":
     downloadData(request.data, createExport, currentSalesChannel);
     break;
   case "updateDesc":  
     saveDescToDatabase(request.desc, request.item);
     break; 
   case "retrieveSalesChannel":
     currentSalesChannel = request.salesChannel;
     downloadImages = request.downloadImages;
     ProcessSalesChannel(request.listingType);
     break;
   case "copyListing":
     console.log("Copy Requested");
     copyToSalesChannel = request.salesChannel;
     await copyEbayListingDetails(request.itemNumber);
     break;
   case "listingCopied": 
     console.log("Copy Complete");
     console.log(request.listing);
     console.log("Retrieve Description Requested");
     await retrieveDescription(request.listing);
     break;
   case "descCopied":  
     console.log("Description Copied");
     console.log(request.listing);
     console.log("Cross Post Requested");
     if(copyToSalesChannel === "Mercari"){
       await postListingToMercari(request.listing);
     }
     else{
       await saveListingToDistrict(request.listing);
     }
     updateCrossPostList(request.listing.itemNumber);
     break;
   case "mercariCreated":
     saveNewListing(request.listing);
     if(oldTab.length > 2){
      let tab = oldTab.shift();
      if(tab){
        chrome.tabs.remove(tab);
      }
     }
     break;
 }
});

async function getEbayShippingDetails(itemNumber: string) {
 await delay(getRandomInt(5000, 30000));
 const newTab = await loadTab(`https://www.ebay.com/sl/list?mode=ReviseItem&itemId=${itemNumber}&ReturnURL=https%3A%2F%2Fwww.ebay.com%2Fsh%2Flst%2Factive%3Foffset%3D600%26limit%3D200%26sort%3DavailableQuantity`);
 chrome.scripting.executeScript({
   args: [itemNumber],
   target: { tabId: newTab.id as number },
   func: scrapEbayPostage,
 }).then(() => {
   oldTab.push(newTab.id as number);
 });
}

async function copyEbayListingDetails(itemNumber: string) {
 const newTab = await loadTab(`https://www.ebay.com/sl/list?mode=ReviseItem&itemId=${itemNumber}&ReturnURL=https%3A%2F%2Fwww.ebay.com%2Fsh%2Flst%2Factive%3Foffset%3D600%26limit%3D200%26sort%3DavailableQuantity`);
 chrome.scripting.executeScript({
   args: [itemNumber],
   target: { tabId: newTab.id as number},
   func: copyEbayListing,
 }).then(() => {
   oldTab.push(newTab.id as number);
 });
}

async function ProcessSalesChannel( listingType : string) {
 switch(currentSalesChannel) {
   case "Mercari":
     await retrieveMercariData(downloadImages, searchMercariURLs(listingType)).then(async () => {
       if(removeInactiveListings){
         await removeInactiveItems();
       }
     }); 

     break;
   case "eBay":
     await endEbayInactive(listingType)
     .then(async () => {
       await retrieveEbayData(listingType, downloadImages, lastTimeInactive);
     })
     .then(() => {
       processDescQueue();
     })
     .then(() => {
       console.log(postageQueue.length);
       processShippingInfoQueue();
     });  
     break;
   case "Etsy":
     await retrieveEtsyData(listingType, downloadImages);
     break;
 } 
}

async function processQueue() {
 if (ebayImageQueue.length === 0 || isDownloading) {
   return;
 }

 let itemNumber = ebayImageQueue.shift(); // dequeue the request  
 isDownloading = true;

 delay(getRandomInt(5000, 10000));
 const tab = await loadTab(`https://www.ebay.com/sl/list?mode=ReviseItem&itemId=${itemNumber}&ReturnURL=https%3A%2F%2Fwww.ebay.com%2Fsh%2Flst%2Factive%3Foffset%3D600%26limit%3D200%26sort%3DavailableQuantity`);
 await new Promise((resolve) => {
   chrome.scripting.executeScript({
     args: [itemNumber, downloadImages],
     target: { tabId: tab.id as number },
     func: scrapEbayImages,
   }, () => {
     oldTab.push(tab.id);
     resolve();
   });
 });

 isDownloading = false;
 await delay(getRandomInt(5000, 30000));
 processQueue(); // recursively process the next request in the queue
}

async function processShippingInfoQueue() {
 if (shippingInfoQueue.length === 0 || isDownloading) {
   return;
 }

 let itemNumber = shippingInfoQueue.shift(); // dequeue the request  
 isDownloading = true;

 await getEbayShippingDetails(itemNumber);
 processPostageQueue(); 
 isDownloading = false;
 await delay(getRandomInt(5000, 30000));
 processShippingInfoQueue(); // recursively process the next request in the queue
}

async function postListingToMercari(ebayListing) {
 let tab = await loadTab(mercariConstants.CreateListingUrl);
 oldTab.push(tab.id);
 await delay(getRandomInt(3000, 5000));
 chrome.scripting.executeScript({
   args: [ebayListing],
   target: { tabId: tab.id as number },
   func: createMercariListing,
 }).catch((error) => {
   console.error("Error executing script:", error);  
 });
}

async function saveListingToDistrict(ebayListing) {
 let tab = await loadTab("https://district.net/admin/listings?createProductIn=niknax");
 oldTab.push(tab.id);

 await delay(getRandomInt(3000, 5000));

 chrome.scripting.executeScript({
   args: [ebayListing],
   target: { tabId: tab.id as number },
   func: createDistrictListing,
 }).catch((error) => {
   console.error("Error executing script:", error);
 });
}

async function saveNewListing( ebayListing) {
 console.log(ebayListing.itemNumber);
 let bulkData = [];
 bulkData.push(
 {
   itemTitle: ebayListing.itemTitle,
   itemNumber: ebayListing.itemNumber,
   description: ebayListing.description,
   salesChannel: "Mercari",
   active: true,
   listingDate: new Date().toISOString(),
   listingDateType: 0,
   views: "0",
   likes: "0",
   price: ebayListing.price,
 });

 await saveItemToDatabase(bulkData);
}

async function processDescQueue() {
 
 if(oldTab.length > 5){
   chrome.tabs.remove(oldTab.shift());
 }

 if (descQueue.length === 0 || isDownloading) {
   return;
 }

 let itemNumber = descQueue.shift(); // dequeue the request  
 isDownloading = true;

 const tab = await loadTab(`https://vi.vipr.ebaydesc.com/itmdesc/${itemNumber}`);
 await new Promise((resolve, reject) => {
   chrome.scripting.executeScript({
     args: [itemNumber],
     target: { tabId: tab.id as number },
     func: scrapEbayDescriptions,
   }).then(() => {
     oldTab.push(tab.id);
     isDownloading = false;;
     delay(getRandomInt(5000, 30000)).then(processDescQueue()).then(resolve()); // recursively process the next request in the queue
   }).catch((error) => {
     console.error("Error executing script:", error);
     reject(error);
   });
 });
}

async function processPostageQueue() {
 try {
   if (postageQueue.length === 0) {
     return;
   }

   if(oldTab.length > 5){
     chrome.tabs.remove(oldTab.shift());
   }

   let postage = postageQueue.shift(); // dequeue the request

   const response = await fetch(`${serverURI}/api/listing/${postage.itemNumber}/postage`, {
     method: "post",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify(postage),
   });

   if (!response.ok) {
     console.error("Failed to save postage to the database:", postage);
   }

   processPostageQueue(); // recursively process the next request in the queue
 } catch (error) {
   console.error("Error saving postage to the database:", error);
 }
}

async function saveDescToDatabase(desc, itemNumber) {
 try {
   const response = await fetch(`${serverURI}/api/listing/${itemNumber}/description`, {
     method: "Put",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({description:desc}),
   });

   if (!response.ok) {
     console.error("Failed to save item to the database:", desc);
   }
 } catch (error) {
   console.error("Error saving item to the database:", error);
 }
}

async function saveItemToDatabase(item) {
 try {

   item = JSON.stringify(item, null, 2); // Pretty print the JSON
   

   const response = await fetch(`${serverURI}/api/BulkListing`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: item,
   });

   if (!response.ok) {
     console.error("Failed to save item to the database:", item);
   }
 } catch (error) {
   console.error("Error saving item to the database:", error);
 }
}

function getMispricedItems() {
 return new Promise(resolve => {
   fetch(`${serverURI}/api/Listing/mispriced`).then(response => response.json()).then(data => {
       if(data.success  ){
         for(const item of data.data){
           if(item.itemNumber.startsWith("m")){
               priceChanges.set(item.itemNumber, item.crossPostPrice);
           }
         }
         resolve(); 
       }
   });

 });
}

async function retrieveEbayData(listingType, downloadImages) {
 try {
   const urls =  searchEbayURLs(listingType);

   for(const url of urls){
     let pageCount = 1;
     let totalPages = 0;

     do{
       const tab = await getActiveTab(url.url, pageCount, "eBay");
       await delay(getRandomInt(5000, 30000));
       const result = await new Promise(resolve => {
         chrome.scripting.executeScript({
           args:[url.activeListings, downloadImages],
           target: { tabId: tab.id as number },
           func: scrapDataEbay,
         }, resolve);
       });
       
       if(result[0].result) {
         if(totalPages === 0) {
           let itemCount = +result[0].result.count.replace(",", "");
           totalPages = Math.ceil(itemCount / 200);
         }
         pageCount++;

       }
     }while(pageCount <= totalPages );

     if(listingType === 'all'){
       chrome.storage.sync.set({ ebayLastInactive: Date.now() }, function() {
           console.log('EbayLastInactive saved.');
         }
       );
     }

     processQueue(); // process the queue
           
   }
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function endEbayInactive(listingType) {
 try {
   if(listingType !== 'active' && listingType !== 'all') {
     return;
   }

   const urls =  searchEbayURLs('active');

   for(const url of urls){
     let pageCount = 1;
  
     const tab = await getActiveTab(url.url, pageCount, "eBay");
     await delay(getRandomInt(5000, 30000));
     await new Promise(resolve => {
       chrome.scripting.executeScript({
         target: { tabId: tab.id as number },
         func: endEbayListings,
       }, resolve);
     });
   }
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function retrieveEtsyData(listingType, downloadImages) {
 try {
   let titles = []; //Array to hold scraped data

   //Use Type to find the URL
   let url = searchEtsyURLs(listingType);
   console.log(url);
   for (const link of url) {
     const activeListings = link.activeListings;
     let totalPages = 0;
     let pageCount = 1;
     let url = link.url;

     do {
       const tab = await loadTab(url);
       await delay(getRandomInt(3000, 5000));

       const result = await new Promise(resolve => {
         chrome.scripting.executeScript({
           args: [activeListings, link.type, downloadImages],
           target: { tabId: tab.id as number },
           func: scrapDataEtsy,
         }, resolve);
       });

       if(result[0].result.count) {
         totalPages = parseInt(result[0].result.count, 10);   // Pager can add pages as we scroll forward
       }

       pageCount++;
       url = link.url.replace(',view:table',',page:' + pageCount + ',view:table');
     } while (pageCount <= totalPages);
     // Loop through each page
   }

   if(titles.length > 0) {
     downloadData(titles, createExport);
   }    
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function retrieveDescription(listing) {
 if(oldTab.length > 5){
   chrome.tabs.remove(oldTab.shift());
 }

 const tab = await loadTab(`https://vi.vipr.ebaydesc.com/itmdesc/${listing.itemNumber}`);
 chrome.scripting.executeScript({
   args: [listing],
   target: { tabId: tab.id as number },
   func: copyDescription,
 }).then(() => {
   oldTab.push(tab.id);
 }).catch((error) => {
   console.error("Error executing script:", error);
 });
}

async function removeInactiveItems() {
 try {
   const urls =  searchMercariURLs('inactive')[0];

   const tab = await loadTab(urls.url);
   await delay(getRandomInt(5000, 30000));
   await new Promise(resolve => {
     chrome.scripting.executeScript({
       target: { tabId: tab.id as number },
       func: removeInactive,
     }, resolve);
   });
   
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function retrieveMercariData( downloadImages, mercariURLs) {
 try {
   let titles = []; //Array to hold scraped data

   //Use Type to find the URL
   let url = mercariURLs;
  
   for (const link of url) {
     const activeListings = link.activeListings;
     let totalPages = 0;
     let pageCount = 1;

     do {
       // Load first Page
       const tab = await getActiveTab(link.url, pageCount, "Mercari");
       await delay(getRandomInt(3000, 5000));

       if (totalPages === 0) {
         totalPages = await retrievePageCount(link.type, tab);
       }

       let result  = await new Promise(resolve => {
         chrome.scripting.executeScript({
           args: [activeListings, link.type, downloadImages],
           target: { tabId: tab.id as number },
           func: scrapData,
         }, resolve);
       });

       if(result[0].result) {
         titles.push(...result[0].result);
       }

       pageCount++;
     } while (pageCount <= totalPages);
     // Loop through each page
   }

   if(titles.length > 0) {
     downloadData(titles, createExport);
   }

 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function downloadData(data, createExport, currentSalesChannel) {
 if(!createExport) { 
     return;
 }

 //Enhance Data for download
 if(currentSalesChannel === 'Mercari') {
     data = await retrieveMercariDetails(data);
 }

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

async function retrieveMercariDetails(data) {
 //Enhance Data for download

   for(const item of data){

     item.description  = "";
     item.itemTitle = item.itemTitle.replace(/,/g, '');

     const link = getMercariItemURL() + item.itemNumber;
     const tab = await loadTab(link);
     await delay(getRandomInt(3000, 5000));

     await new Promise(resolve => {
       chrome.scripting.executeScript({
         target: { tabId: tab.id as number },
         func: retrieveItemDetails,
       }, resolve);

       } ).then((shipping) => {
         item.shipping = shipping[0].result;
         console.log('Shipping: ' + shipping);
         
     }).then(() => {
       chrome.tabs.remove(tab.id);
     });
     
   }
 
 return data;
}

function updateCrossPostList(itemNumber){
 chrome.storage.sync.get(['listData'], function(result) {
   if (result.listData) {
     let data = result.listData;
     let item = data.find(x => x.itemNumber === itemNumber);
     data.splice(data.indexOf(item),1);
     chrome.storage.sync.set({ listData: data }, function() {
       console.log('Data is updated in Chrome storage');
     });
   }
 }); 
}