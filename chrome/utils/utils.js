import { getMercariItemURL } from './constants.js';
import { loadTab } from './utils/tab.js';
import { retrieveItemDetails } from '../mercari/itemPageDetails.js';

export async function downloadData(data, createExport, currentSalesChannel) {
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
            target: { tabId: tab.id },
            function: retrieveItemDetails,
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
  
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}