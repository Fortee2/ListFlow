import { scrapDataEbay } from "./functions/ebay/scrapDataEbay";
import { scrapEbayImages } from "./functions/ebay/scrapImages";
import { scrapEbayDescriptions } from "./functions/ebay/scrapDescription";
import { scrapEbayPostage } from "./functions/ebay/postage";
import { scrapData, retrievePageCount } from "./functions/mercari/scrapDataMercari";
import { searchEbayURLs, searchMercariURLs, searchEtsyURLs, getMercariItemURL } from './utils/urls';
import {mercariConstants} from "./functions/mercari/mercariConstants";
import { retrieveItemDetails } from "./functions/mercari/itemPageDetails";
import { scrapDataEtsy } from "./functions/etsy/scrapDataEtsy";
import { endEbayListings } from "./functions/ebay/endListings";
import { removeInactive } from "./functions/mercari/removeInactive";
import { getRandomInt, delay } from "./utils/utils";
import { getActiveTab, loadTab } from "./utils/tabs";
import { createMercariListing } from "./functions/mercari/createMercariListing";
import { copyDescription, copyEbayListing } from "./functions/ebay/copyListing";
import { createDistrictListing } from "./functions/district/createDistrictListing";
import ImgRequest from "./domain/imgRequest";
import OnInstall from "./events/onInstall";
import PostageRequest from "./domain/postageRequest";
import IListing from "./domain/IListing";
import IListingRequest from "./domain/IListingRequest";
import { IScrapResult } from "./domain/IScrapResult";
import IUrlResult from "./domain/IUrlResult";

interface MessageRequest {
  action: string;
  itemNumber?: string;
  item?: IListingRequest[] | string;  // Can be either array for saveToListingAPI or string for updateDesc
  majorElement?: string;
  minorElement?: string;
  packageLength?: string;
  packageWidth?: string;
  packageHeight?: string;
  data?: any[];
  desc?: string;
  salesChannel?: string;
  downloadImages?: boolean;
  listingType?: string;
  listing?: IListing;
}

interface StorageData {
  listData?: any[];
  serverURI?: string;
  createExport?: boolean;
  removeInactiveListings?: boolean;
  lastTimeInactive?: string;
}

let ebayImageQueue: string[] = [];
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
}, function(data: StorageData) {
 if (data.serverURI) serverURI = data.serverURI;
 if (data.createExport !== undefined) createExport = data.createExport;
 if (data.removeInactiveListings !== undefined) removeInactiveListings = data.removeInactiveListings;
 if (data.lastTimeInactive) lastTimeInactive = data.lastTimeInactive;
});

chrome.runtime.onMessage.addListener(async (request: MessageRequest) => {
 console.log("Received message:", request.action);
 switch(request.action) {
   case "downloadEbayImage":
     if (request.itemNumber) {
       ebayImageQueue.push(request.itemNumber); // enqueue the request
       processQueue(); // process the queue
     }
     break;
   case "downloadEbayDesc":
     if (request.itemNumber) {
       descQueue.push(request.itemNumber); // enqueue the request
     }
     break;
   case "saveToListingAPI":
     if (request.item && Array.isArray(request.item)) {
       saveItemToDatabase(request.item as IListingRequest[]);
     }
     break;
   case "queueEbayNoQty":
     if (request.itemNumber) {
       zeroQtyQueue.push(request.itemNumber);
     }
     break;
   case "queueShippingInfo":
     if (request.itemNumber) {
       shippingInfoQueue.push(request.itemNumber);
     }
     break;
   case "queueEbayPostage":
     if (request.majorElement && request.minorElement && request.packageLength && 
         request.packageWidth && request.packageHeight && request.item && typeof request.item === 'string') {
       postageQueue.push({
         majorElement: request.majorElement,
         minorElement: request.minorElement,
         packageLength: request.packageLength,
         packageWidth: request.packageWidth,
         packageHeight: request.packageHeight,
         itemNumber: request.item
       });
       processPostageQueue(); // process the queue
     }
     break;
   case "downloadData":
     if (request.data) {
       downloadData(request.data, createExport, currentSalesChannel);
     }
     break;
   case "updateDesc":  
     if (request.desc && typeof request.item === 'string') {
       saveDescToDatabase(request.desc, request.item);
     }
     break; 
   case "retrieveSalesChannel":
     if (request.salesChannel && request.downloadImages !== undefined && request.listingType) {
       currentSalesChannel = request.salesChannel;
       downloadImages = request.downloadImages;
       ProcessSalesChannel(request.listingType);
     }
     break;
   case "copyListing":
     if (request.salesChannel && request.itemNumber) {
       console.log("Copy Requested");
       copyToSalesChannel = request.salesChannel;
       await copyEbayListingDetails(request.itemNumber);
     }
     break;
   case "listingCopied": 
     if (request.listing) {
       console.log("Copy Complete");
       console.log(request.listing);
       console.log("Retrieve Description Requested");
       await retrieveDescription(request.listing);
     }
     break;
   case "descCopied":  
     if (request.listing) {
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
     }
     break;
   case "mercariCreated":
     if (request.listing) {
       saveNewListing(request.listing);
       if(oldTab.length > 2){
        let tab = oldTab.shift();
        if(tab){
          chrome.tabs.remove(tab);
        }
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

async function ProcessSalesChannel(listingType: string) {
 switch(currentSalesChannel) {
   case "Mercari":
     await retrieveMercariData(searchMercariURLs(listingType)).then(async () => {
       if(removeInactiveListings){
         await removeInactiveItems();
       }
     }); 
     break;
   case "eBay":
     await endEbayInactive(listingType)
     .then(async () => {
       await retrieveEbayData(listingType, lastTimeInactive);
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
     await retrieveEtsyData(listingType);
     break;
 } 
}

async function processQueue() {
 if (ebayImageQueue.length === 0 || isDownloading) {
   return;
 }

 let itemNumber = ebayImageQueue.shift(); // dequeue the request  
 if (!itemNumber) return;

 isDownloading = true;

 delay(getRandomInt(5000, 10000));
 const tab = await loadTab(`https://www.ebay.com/sl/list?mode=ReviseItem&itemId=${itemNumber}&ReturnURL=https%3A%2F%2Fwww.ebay.com%2Fsh%2Flst%2Factive%3Foffset%3D600%26limit%3D200%26sort%3DavailableQuantity`);
 await new Promise<void>((resolve) => {
   chrome.scripting.executeScript({
     args: [itemNumber, downloadImages],
     target: { tabId: tab.id as number },
     func: scrapEbayImages,
   }, () => {
     if (tab.id !== undefined) {
       oldTab.push(tab.id);
     }
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

 if(!itemNumber){
    return;
  }

 isDownloading = true;

 await getEbayShippingDetails(itemNumber);
 processPostageQueue(); 
 isDownloading = false;
 await delay(getRandomInt(5000, 30000));
 processShippingInfoQueue(); // recursively process the next request in the queue
}

async function postListingToMercari(ebayListing: IListing) {
 let tab = await loadTab(mercariConstants.CreateListingUrl);
 oldTab.push(tab.id as number);
 await delay(getRandomInt(3000, 5000));
 chrome.scripting.executeScript({
   args: [ebayListing],
   target: { tabId: tab.id as number },
   func: createMercariListing,
 }).catch((error) => {
   console.error("Error executing script:", error);  
 });
}

async function saveListingToDistrict(ebayListing:IListing) {
 let tab = await loadTab("https://district.net/admin/listings?createProductIn=niknax");
 oldTab.push(tab.id as number);

 await delay(getRandomInt(3000, 5000));

 chrome.scripting.executeScript({
   args: [ebayListing],
   target: { tabId: tab.id as number },
   func: createDistrictListing,
 }).catch((error) => {
   console.error("Error executing script:", error);
 });
}

async function saveNewListing(ebayListing: IListing) {
 console.log(ebayListing.itemNumber);
 let bulkData:IListingRequest[] = [];
 bulkData.push({
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
   chrome.tabs.remove(oldTab.shift() as number);
 }

 if (descQueue.length === 0 || isDownloading) {
   return;
 }

 let itemNumber = descQueue.shift(); // dequeue the request  
 if (!itemNumber) return;

 isDownloading = true;

 const tab = await loadTab(`https://vi.vipr.ebaydesc.com/itmdesc/${itemNumber}`);
 await new Promise<void>((resolve, reject) => {
   chrome.scripting.executeScript({
     args: [itemNumber],
     target: { tabId: tab.id as number },
     func: scrapEbayDescriptions,
   }).then(() => {
     oldTab.push(tab.id as number);
     isDownloading = false;
     delay(getRandomInt(5000, 30000)).then(() => processDescQueue()).then(() => resolve()); // recursively process the next request in the queue
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
     chrome.tabs.remove(oldTab.shift() as number);
   }

   let postage = postageQueue.shift(); // dequeue the request

   if(!postage){
     return;
   }

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

async function saveDescToDatabase(desc: string, itemNumber: string) {
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

async function saveItemToDatabase(item: IListingRequest[]) {
 try {
   let jsonItem = JSON.stringify(item, null, 2); // Pretty print the JSON
   
   const response = await fetch(`${serverURI}/api/BulkListing`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: jsonItem,
   });

   if (!response.ok) {
     console.error("Failed to save item to the database:", item);
   }
 } catch (error) {
   console.error("Error saving item to the database:", error);
 }
}

async function retrieveEbayData(listingType: string, lastTimeInactive: string) {
 try {
   const urls = searchEbayURLs(listingType);

   for(const url of urls){
     let pageCount = 1;
     let totalPages = 0;

     do{
       const tab = await getActiveTab(url.url, pageCount, "eBay");
       await delay(getRandomInt(5000, 30000));
       const result = await new Promise<IScrapResult>(resolve => {
         chrome.scripting.executeScript({
           args:[url.activeListings, lastTimeInactive],
           target: { tabId: tab.id as number },
           func: scrapDataEbay,
         }, (injectionResults) => resolve(injectionResults[0].result as IScrapResult));
       });
       
       if(result) {
         if(totalPages === 0) {
           let itemCount = +result.count;
           totalPages = Math.ceil(itemCount / 200);
         }
         pageCount++;
       }
     }while(pageCount <= totalPages );

     if(listingType === 'all'){
       chrome.storage.sync.set({ ebayLastInactive: Date.now() }, function() {
           console.log('EbayLastInactive saved.');
       });
     }

     processQueue(); // process the queue
   }
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function endEbayInactive(listingType: string) {
 try {
   if(listingType !== 'active' && listingType !== 'all') {
     return;
   }

   const urls = searchEbayURLs('active');

   for(const url of urls){
     let pageCount = 1;
  
     const tab = await getActiveTab(url.url, pageCount, "eBay");
     await delay(getRandomInt(5000, 30000));
     await new Promise<void>(resolve => {
       chrome.scripting.executeScript({
         target: { tabId: tab.id as number },
         func: endEbayListings,
       }, () => resolve());
     });
   }
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function retrieveEtsyData(listingType: string) {
 try {
   let titles: string[] = []; //Array to hold scraped data

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

       const result = await new Promise<IScrapResult[]>(resolve => {
         chrome.scripting.executeScript({
           args: [activeListings, link.type],
           target: { tabId: tab.id as number },
           func: scrapDataEtsy,
         }, (results) => resolve(results as unknown as IScrapResult[]));
       });

       if(result[0].count) {
         totalPages = result[0].count;   // Pager can add pages as we scroll forward
       }

       pageCount++;
       url = link.url.replace(',view:table',',page:' + pageCount + ',view:table');
     } while (pageCount <= totalPages);
     // Loop through each page
   }

   if(titles.length > 0) {
     downloadData(titles, createExport, currentSalesChannel);
   }    
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function retrieveDescription(listing: IListing) {
 if(oldTab.length > 5){
   chrome.tabs.remove(oldTab.shift() as number);
 }

 const tab = await loadTab(`https://vi.vipr.ebaydesc.com/itmdesc/${listing.itemNumber}`);
 chrome.scripting.executeScript({
   args: [listing],
   target: { tabId: tab.id as number },
   func: copyDescription,
 }).then(() => {
   oldTab.push(tab.id as number);
 }).catch((error) => {
   console.error("Error executing script:", error);
 });
}

async function removeInactiveItems() {
 try {
   const urls = searchMercariURLs('inactive')[0];

   const tab = await loadTab(urls.url);
   await delay(getRandomInt(5000, 30000));
   await new Promise<void>(resolve => {
     chrome.scripting.executeScript({
       target: { tabId: tab.id as number },
       func: removeInactive,
     }, () => resolve());
   });
   
 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function retrieveMercariData(mercariURLs: IUrlResult[]) {
 try {
   let titles: IListingRequest[] = []; //Array to hold scraped data

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

       let result = await new Promise<IScrapResult[]>(resolve => {
         chrome.scripting.executeScript({
           args: [activeListings, link.type],
           target: { tabId: tab.id as number },
           func: scrapData,
         }, (results) => resolve(results as unknown as IScrapResult[]));
       });

       if(result[0].result) {
         titles.push(...result[0].result);
       }

       pageCount++;
     } while (pageCount <= totalPages);
     // Loop through each page
   }

   if(titles.length > 0) {
     downloadData(titles, createExport, currentSalesChannel);
   }

 } catch (error) {
   console.error("Error executing script:", error);
 }
}

async function downloadData(data: Array<IListingRequest | string>, createExport: boolean, currentSalesChannel: string): Promise<void> {
 if(!createExport) { 
     return;
 }

 //Enhance Data for download
 if(currentSalesChannel === 'Mercari') {
     data = await retrieveMercariDetails(data);
 }

 let csvContent = '';
 if (Array.isArray(data) && data.length > 0) {
     // Header row
     const header = Object.keys(data[0]).join(',');
     csvContent += header + '\n';

     // Data rows
     data.forEach(row => {
         const rowData = Object.values(row).join(',');
         csvContent += rowData + '\n';
     });
 }

 const blob = new Blob([csvContent], { type: 'text/csv' });

 const reader = new FileReader();
 reader.onloadend = function() {
     const base64data = reader.result;
     if (typeof base64data === 'string') {
       chrome.downloads.download({
           url: base64data,
           filename: 'data.csv'
       });
     }
 }
 reader.readAsDataURL(blob);
}

async function retrieveMercariDetails(data: Array<IListingRequest | string>): Promise<Array<IListingRequest | string>> {
 //Enhance Data for download
 for(let i = 0; i < data.length; i++) {
   const item = data[i];
   if (typeof item === 'string') {
     continue; // Skip string items
   }

   // Now TypeScript knows item is IListingRequest
   item.description = "";
   if (item.itemTitle) {
     item.itemTitle = item.itemTitle.replace(/,/g, '');
   }

   const link = getMercariItemURL() + item.itemNumber;
   const tab = await loadTab(link);
   await delay(getRandomInt(3000, 5000));

   const shipping = await new Promise<any>(resolve => {
     chrome.scripting.executeScript({
       target: { tabId: tab.id as number },
       func: retrieveItemDetails,
     }, (result) => resolve(result));
   });

   if (shipping && shipping[0] && shipping[0].result) {
     (item as any).shipping = shipping[0].result;
     console.log('Shipping: ' + shipping);
   }

   chrome.tabs.remove(tab.id as number);
 }
 
 return data;
}

function updateCrossPostList(itemNumber: string) {
 chrome.storage.sync.get(['listData'], function(result: StorageData) {
   if (result.listData) {
     let data = result.listData;
     let item = data.find((x: { itemNumber: string }) => x.itemNumber === itemNumber);
     if (item) {
       data.splice(data.indexOf(item), 1);
       chrome.storage.sync.set({ listData: data }, function() {
         console.log('Data is updated in Chrome storage');
       });
     }
   }
 }); 
}
