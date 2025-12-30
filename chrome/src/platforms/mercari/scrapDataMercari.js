export async function scrapData(activeListings, listingType) {
    let bulkData = [];
  
    function checkReadyState() {
      return new Promise((resolve, reject) => {
        let timeoutId = setTimeout(() => {
          clearTimeout(timeoutId);
          reject(new Error('Page load timed out after 10 seconds'));
        }, 10000); // 10 seconds timeout
    
        function check() {
          if(document.readyState === 'complete') {
            clearTimeout(timeoutId);
            console.log('readyState is complete');
            retrieveMercari().then(resolve).catch((error) => console.log(error)); 
            resolve();
          } else {
            console.log('readyState is not complete');
            setTimeout(check, 1000);
          }
        }
    
        check();
      });
    }
  
    function parseDate(dateString) {
      try{
          if (dateString.includes('ago')) {
          let timePortion = dateString.split('ago')[0].trim();
        
          if (timePortion.includes('h')) {
            let hours = timePortion.split('h')[0].trim();
            let date = new Date();
            date.setHours(date.getHours() - hours);
            return date.toISOString();
          }
      
          if (timePortion.includes('d')) {  
            let days = timePortion.split('d')[0].trim();
            let date = new Date();
            date.setDate(date.getDate() - days);
            return date.toISOString();
          }
      
          if (timePortion.includes('m')) {
            let minutes = timePortion.split('m')[0].trim();
            let date = new Date();
            date.setMinutes(date.getMinutes() - minutes);
            return date.toISOString();
          }
      
          console.log('Unable to parse date');
          return new Date().toISOString();
        }

        return new Date(dateString).toISOString();
      }
      catch{
        return new Date().toISOString();
      }
    }

    function retrieveMercari() {
      if(listingType === 'active') {
        return parseListings();
      } else {
        return parseSoldListings();
      }
    }

    async function getDetailPageDate(relativeUrl, testId, stripPrefix = null) {
      return new Promise((resolve, reject) => {
        let checkInterval = null;
        let timeoutId = null;
        
        const cleanup = (window) => {
          if (checkInterval) clearInterval(checkInterval);
          if (timeoutId) clearTimeout(timeoutId);
          if (window && !window.closed) window.close();
        };

        try {
          // Open listing page in new window
          const listingWindow = window.open(window.location.origin + relativeUrl, '_blank');
          
          if (!listingWindow) {
            throw new Error('Failed to open listing window');
          }

          // Wait for page to load and extract date
          checkInterval = setInterval(() => {
            try {
              if (listingWindow.document.readyState === 'complete') {
                cleanup(listingWindow);
                
                // Find the date element using data-testid
                const dateElement = listingWindow.document.querySelector(`p[data-testid="${testId}"]`);
                
                if (dateElement) {
                  let dateText = dateElement.innerText || dateElement.textContent;
                  // Strip prefix if provided (e.g., "Updated " from "Updated 2d ago")
                  if (stripPrefix) {
                    dateText = dateText.replace(stripPrefix, '');
                  }
                  listingWindow.close();
                  resolve(dateText);
                } else {
                  listingWindow.close();
                  reject(new Error(`${testId} element not found`));
                }
              }
            } catch (error) {
              cleanup(listingWindow);
              reject(error);
            }
          }, 500);

          // Timeout after 10 seconds
          timeoutId = setTimeout(() => {
            cleanup(listingWindow);
            reject(new Error('Timeout waiting for listing page to load'));
          }, 10000);

        } catch (error) {
          cleanup(null);
          reject(error);
        }
      });
    }

    async function getInactiveListingDate(relativeUrl) {
      return getDetailPageDate(relativeUrl, 'UpdatedOn', /^Updated\s+/i);
    }

    async function parseSoldListings() {
      // For inactive listings, use the new approach to open detail pages
      if (listingType === 'inactive') {
        return parseInactiveListings();
      }

      // For inprogress and complete, use the original approach
      return new Promise((resolve, reject) => {
        try{
          const lis = document.querySelectorAll('tr[data-testid="ListingRow"]')
          let titleColumn = 1;
          let dateColumn = 4;
          let likesColumn = 3;
          let viewsColumn = 4;
        
          lis.forEach(f => {
            const tds = f.getElementsByTagName('td');
            const ele = tds[titleColumn].getElementsByTagName('div')[0];
            const titleLink = ele.getElementsByTagName('a')[0];
            const itmNumber = titleLink.href.split('/')[5]
            const itemTitle = titleLink.innerText;
            const price = f.getElementsByTagName('p')[0].innerText.replace('$', '').trim();
  
            const eleDate = tds[dateColumn].innerText;
            console.log(dateColumn);
            console.log( tds);
            const parsedDate = parseDate(eleDate);
  
            const eleLikes = tds[likesColumn].innerText;
            const eleViews = tds[viewsColumn].innerText;
  
            var itm = {  
              itemTitle: itemTitle,
              itemNumber: itmNumber,
              description: itemTitle,
              salesChannel: 'Mercari',
              active: activeListings,
              listingDate: parsedDate,
              listingDateType: 2,
              views: eleViews,
              likes: eleLikes,
              price: price
            };  
  
            console.log(itm);
  
            bulkData.push(itm);
          });
  
          console.log('bulkData', bulkData);
          chrome.runtime.sendMessage({ 
            action: 'saveToListingAPI',
            item: bulkData
          });
  
          resolve(bulkData);
        }
        catch (error) {
          reject(error);
        }
      });
    }

    async function parseInactiveListings() {
      const lis = document.querySelectorAll('tr[data-testid="ListingRow"]');
      let failedListings = [];
      
      console.log(`Starting to scrape ${lis.length} inactive listings...`);
      
      for (const [index, row] of Array.from(lis).entries()) {
        try {
          // Extract basic info from table row
          const tds = row.getElementsByTagName('td');
          const ele = tds[2].getElementsByTagName('div')[0];
          const titleLink = ele.getElementsByTagName('a')[0];
          const itmNumber = titleLink.href.split('/')[5];
          const itemTitle = titleLink.innerText;
          const price = row.getElementsByTagName('p')[0].innerText.replace('$', '').trim();
          
          const eleLikes = tds[4].innerText;
          const eleViews = tds[5].innerText;

          // Find the ItemLink to get the relative URL
          const itemLink = row.querySelector('a[data-testid="ItemLink"]');
          if (!itemLink) {
            throw new Error('ItemLink not found');
          }
          
          const relativeUrl = itemLink.getAttribute('href');
          
          // Add random delay before opening detail page
          if (index > 0) {
            await randomDelay(1500, 3500);
          }
          
          // Get the updated date from detail page
          const dateText = await getInactiveListingDate(relativeUrl);
          const parsedDate = parseDate(dateText);
          
          var itm = {  
            itemTitle: itemTitle,
            itemNumber: itmNumber,
            description: itemTitle,
            salesChannel: 'Mercari',
            active: activeListings,
            listingDate: parsedDate,
            listingDateType: 1,
            views: eleViews,
            likes: eleLikes,
            price: price
          };  

          console.log(`Scraped item ${index + 1}/${lis.length}:`, itm);
          bulkData.push(itm);

        } catch (error) {
          const itmNumber = row.getElementsByTagName('td')[2]?.getElementsByTagName('a')[0]?.href.split('/')[5] || 'unknown';
          console.error(`Failed to scrape listing ${itmNumber}:`, error.message);
          failedListings.push(itmNumber);
        }
      }

      // Log summary
      console.log(`Scraping complete. Successfully scraped ${bulkData.length} listings.`);
      if (failedListings.length > 0) {
        console.error(`Failed to scrape ${failedListings.length} listing(s):`, failedListings);
      }

      console.log('bulkData', bulkData);
      chrome.runtime.sendMessage({ 
        action: 'saveToListingAPI',
        item: bulkData
      });

      return bulkData;
    }

    function randomDelay(min = 1000, max = 3000) {
      return new Promise(resolve => {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        setTimeout(resolve, delay);
      });
    }

    async function getListingDate(relativeUrl) {
      return getDetailPageDate(relativeUrl, 'ItemDetailsPosted');
    }

    async function parseListings() {
      const lis = document.querySelectorAll('tr[data-testid="ListingRow"]');
      let failedListings = [];
      
      console.log(`Starting to scrape ${lis.length} active listings...`);
      
      for (const [index, row] of Array.from(lis).entries()) {
        try {
          // Extract basic info from table row
          const ele = row.getElementsByTagName('td')[2].getElementsByTagName('div')[0];
          const titleLink = ele.getElementsByTagName('a')[0];
          const itmNumber = titleLink.href.split('/')[5];
          const itemTitle = titleLink.innerText;
          const price = row.querySelector('input[name="price"]').value.replace('$', '').trim();
          
          const eleLikes = row.getElementsByTagName('td')[3].innerText;
          const eleViews = row.getElementsByTagName('td')[4].innerText;

          // Find the ItemLink to get the relative URL
          const itemLink = row.querySelector('a[data-testid="ItemLink"]');
          if (!itemLink) {
            throw new Error('ItemLink not found');
          }
          
          const relativeUrl = itemLink.getAttribute('href');
          
          // Add random delay before opening detail page
          if (index > 0) {
            await randomDelay(1500, 3500);
          }
          
          // Get the listing date from detail page
          const dateText = await getListingDate(relativeUrl);
          const parsedDate = parseDate(dateText);
          
          var itm = {  
            itemTitle: itemTitle,
            itemNumber: itmNumber,
            description: itemTitle,
            salesChannel: 'Mercari',
            active: activeListings,
            listingDate: parsedDate,
            listingDateType: 0,
            views: eleViews,
            likes: eleLikes,
            price: price
          };  

          console.log(`Scraped item ${index + 1}/${lis.length}:`, itm);
          bulkData.push(itm);

        } catch (error) {
          const itmNumber = row.getElementsByTagName('td')[2]?.getElementsByTagName('a')[0]?.href.split('/')[5] || 'unknown';
          console.error(`Failed to scrape listing ${itmNumber}:`, error.message);
          failedListings.push(itmNumber);
        }
      }

      // Log summary
      console.log(`Scraping complete. Successfully scraped ${bulkData.length} listings.`);
      if (failedListings.length > 0) {
        console.error(`Failed to scrape ${failedListings.length} listing(s):`, failedListings);
      }

      console.log('bulkData', bulkData);
      chrome.runtime.sendMessage({ 
        action: 'saveToListingAPI',
        item: bulkData
      });

      return bulkData;
    }

    await checkReadyState(); 
    return bulkData;
}

export async function retrievePageCount(listingType, tab){
  const resultCnt = await new Promise(resolve => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: readTotalItems,
    }, resolve);
  });

  if(resultCnt[0].result) {
    let indx = 0;  //defaulting to Active

    switch(listingType) {
      case 'inactive':
        indx = 1;
        break;
      case 'inprogress':
        indx = 2;
        break;
      case 'complete':
        indx = 3;
        break;
    }

    let itemCount = +resultCnt[0].result[indx].replace(',', '');
    return Math.ceil(itemCount / 20);
  }

  return 0;
}

function readTotalItems() {
  console.log('readTotalItems');
  const div = document.querySelectorAll('p[data-testid="FilterCount"]');
  let counts = [div[0].innerHTML , div[1].innerHTML, div[4].innerHTML, div[5].innerHTML];
  return counts;
}
