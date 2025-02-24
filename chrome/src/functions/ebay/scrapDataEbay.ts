import { IScrapResult } from "../../domain/IScrapResult";
import IListingRequest from "../../domain/IListingRequest";

export async function scrapDataEbay(activeListings: boolean,lastTimeInactive: string) : Promise<IScrapResult> {
    let bulkData: IListingRequest[] = [];
    let itemCount = 0;
    
    async function  checkReadyState() {
      return new Promise<IScrapResult>((resolve, reject) => {
        let timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error('Page load timed out after 10 seconds'));
        }, 10000); // 10 seconds timeout
    
        function check() {
          if(document.readyState === 'complete') {
            clearTimeout(timeoutId);
            readTotalItems().then((itemCount) => {
              retrieveEbay(activeListings, lastTimeInactive).then(
                () => {
                  resolve({'result': bulkData, 'count': itemCount});
                }
              );
            });
          } else {
            setTimeout(check, 1000);
          }
        }
    
        check();
      });
    } 

    function readTotalActiveListings(): Promise<number> {
      return new Promise<number>((resolve) => {
        console.log('readTotalItems');
        const div = document.querySelector('span[class="results-count"]');
        if(!div) {
          resolve(0);
          return;
        }
        let totalText = div.textContent?.trim() ?? "";
        totalText = totalText.replace('(', '').replace(')','').trim();
        itemCount = parseInt(totalText);
        resolve(itemCount);
      });
    }

    function readTotalItems(): Promise<number> {
      if(activeListings) {
        return readTotalActiveListings();
      }else{
        return new Promise<number>((resolve) => {
          const span = document.querySelector('span[class="result-range"]');
          let totalText = span?.textContent?.trim() ?? "";

          let totalPieces = totalText.split('of');
          totalText= totalPieces[1].replace(',','').trim();

          resolve(parseInt(totalText));
        });
      }
    }
  
    function parseEbayDate(dateString:string) {
      let testString = dateString.replace(' at ', ' ');
      let idx = testString.indexOf('am');
  
      if(idx === -1) {
        idx = testString.indexOf('pm');
      }
  
      testString = testString.substring(0, idx) +  ' ' + testString.substring(idx);; 
  
      let date = new Date(testString).toISOString();
  
      return date;
    }
  
   async function retrieveEbay(activeListings:boolean, lastTimeInactive:string) {
      const trs = Array.from(document.querySelectorAll('tr[class="grid-row"]'));
      
      for(const f of trs) {
        let div = f.querySelector('div[class="column-title__text"]');
        let divDate =  null;
        let endedStatus = 'Unsold';
        let views =  "0";
        let watchers = "0";
        let listPrice;
        let qty = '1';
        let listStatus = activeListings;

        if(activeListings){
          divDate = parseEbayDateFromElement(f);
          views = parseEbayViewsFromElement(f);
          watchers = parseEbayWatchersFromElement(f);
          listPrice = parseEbayPrice(f);
          //qty = parseAvailableQuantity(f);
        }else{
          divDate = f.querySelector('td[class="shui-dt-column__actualEndDate shui-dt--left"]')?.querySelector('div[class="shui-dt--text-column"]')?.querySelectorAll('div')[0].innerHTML;
          endedStatus = parseEbayEndedStatus(f);
          listPrice = f.querySelector('td[class="shui-dt-column__price shui-dt--right"]')?.querySelector('div[class="col-price__current"]')?.querySelector('span')?.innerHTML.replace('$', '').trim() || "0";
        }

        let listingType;
        let listingDate = parseEbayDate(divDate as string);
        let a = div?.querySelector('a');
        let itemNumber = a?.href.split('/')[4];

        if(!a) {
          continue;
        }

        if (activeListings) {        
          listingType = 0;
        } else {
          let endDate = new Date(listingDate);
          let lastInactive = new Date(lastTimeInactive);

          //We have already processed this item
          if (endDate < lastInactive) {
            continue;
          }

          if (endedStatus === "Unsold") {
            listingType = 1;
          } else {
            listingType = 2;
          }
        }

        bulkData.push({ 
          itemTitle: a.innerHTML ,
          itemNumber: itemNumber ?? "",
          description: a.innerHTML,
          salesChannel: 'eBay',
          active: listStatus,
          listingDate: listingDate,
          listingDateType: listingType,
          views: views,
          likes: watchers,
          price: listPrice
        });  
      }
      
      if(bulkData.length > 0) {
        chrome.runtime.sendMessage({ 
          action: 'saveToListingAPI',
          item: bulkData
        });
      }
    }

    function parseEbayPrice(priceElement: Element):string {
        try{
            if(!priceElement) return "0";

            let price = priceElement.querySelector('td[class="shui-dt-column__price shui-dt--right inline-editable"]')?.querySelector('div[class="col-price__current"]')?.querySelector('span')?.innerText ?? "0";

            if(price.includes('to')){
                return price.split('to')[0].replace('$', '').trim();
            }
            
            return price.replace('$', '').trim();
        }
        catch(e){
            console.log(e);
            return "0";
        }
    }

    function parseAvailableQuantity(element: Element):string {
      try{
        const availableQuantityElement = element.querySelector(
            'td[class="shui-dt-column__availableQuantity shui-dt--right editable inline-editable"]'
        )?.querySelector('div[class="shui-dt--text-column"]')?.querySelector('div');
    
        return availableQuantityElement ? availableQuantityElement.innerText : "0";
      }catch(e){
        console.log(e);
        return "0";
      }
    }
    
    function parseEbayDateFromElement(element:Element):string {
      try{
        const fromElement = element.querySelector('td[class="shui-dt-column__scheduledStartDate shui-dt--left"]')?.querySelector('div[class="shui-dt--text-column"]')?.querySelectorAll('div')[0]?.innerHTML ?? "";
    
        return fromElement;
      }catch(e){
        console.log(e);
        return "";
      }
    }

    function parseEbayViewsFromElement(element:Element):string {
      try{
        const viewsElement = element.querySelector('td[class="shui-dt-column__visitCount shui-dt--right"]')?.querySelector('button[class="fake-link"]')  as HTMLButtonElement;
        if(!viewsElement) return "0";

        let viewsButton = viewsElement.innerText.trim();
        viewsButton = viewsButton.split('\n')[0].trim();

        return viewsButton;
      }catch(e){
        console.log(e);
        return "0";
      }
    }

    function parseEbayWatchersFromElement(element:Element):string {
      try{
        const watchersElement = element.querySelector('td[class="shui-dt-column__watchCount shui-dt--right"]')?.querySelector('div[class="shui-dt--text-column"]')?.querySelector('div')?.innerHTML;
    
        return watchersElement ?? "0";
      }catch(e){
        console.log(e);
        return "0";
      }
    }

    function parseEbayEndedStatus(element:Element):string {
      try{
        if(!element) return "Unsold";

        const endedStatusElement = element.querySelector('td[class="shui-dt-column__soldStatus "]')?.querySelector('div[class="shui-dt--text-column"]')?.querySelector('div')?.innerHTML ?? "Unsold";
    
        return endedStatusElement;
      }catch(e){
        console.log(e);
        return "Unsold";
      }
    }

    return checkReadyState();
  }



