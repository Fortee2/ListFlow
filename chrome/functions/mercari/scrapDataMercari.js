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
        return null;
      }
    
      return new Date(dateString).toISOString();
    }

    function retrieveMercari() {
      if(listingType === 'active') {
        return parseListings();
      } else {
        return parseSoldListings();
      }
    }

    function parseSoldListings() {
      return new Promise((resolve, reject) => {
        try{
          const lis = document.querySelectorAll('tr[data-testid="ListingRow"]')
          let titleColumn = 2;
          let dateColumn = 6;
          let likesColumn = 4;
          let viewsColumn = 5;
          
          switch(listingType) {
            case 'inprogress':
            case 'complete':
              titleColumn = 1;
              dateColumn = 5;
              likesColumn = 3;
              viewsColumn = 4;
              break;
          }
        
          lis.forEach(f => {
            const ele = f.getElementsByTagName('td')[titleColumn].getElementsByTagName('div')[0];
            const titleLink = ele.getElementsByTagName('a')[0];
            const itmNumber = titleLink.href.split('/')[5]
            const itemTitle = titleLink.innerText;
            const price = f.getElementsByTagName('p')[0].innerText.replace('$', '').trim();
  
            const eleDate = f.getElementsByTagName('td')[dateColumn].innerText;
            const parsedDate = parseDate(eleDate);
  
            const eleLikes = f.getElementsByTagName('td')[likesColumn].innerText;
            const eleViews = f.getElementsByTagName('td')[viewsColumn].innerText;
  
            var itm = {  
              itemTitle: itemTitle,
              itemNumber: itmNumber,
              description: itemTitle,
              salesChannel: 'Mercari',
              active: activeListings,
              listingDate: parsedDate,
              listingDateType: listingType == "inactive" ? 1 : 2,
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

    function parseListings() {
      return new Promise((resolve, reject) => {
        try {
          const lis = document.querySelectorAll('tr[data-testid="ListingRow"]')
        
          lis.forEach(f => {
            const ele = f.getElementsByTagName('td')[2].getElementsByTagName('div')[0];
            const titleLink = ele.getElementsByTagName('a')[0];
            const itmNumber = titleLink.href.split('/')[5]
            const itemTitle = titleLink.innerText;
            const price = f.querySelector('input[name="price"]').value.replace('$', '').trim();
  
            const eleDate = f.getElementsByTagName('td')[6].innerText;
            const parsedDate = parseDate(eleDate);
  
            const eleLikes = f.getElementsByTagName('td')[4].innerText;
            const eleViews = f.getElementsByTagName('td')[5].innerText;
  
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
  
            console.log(itm);
  
            bulkData.push(itm);
          });

          console.log('bulkData', bulkData);
          chrome.runtime.sendMessage({ 
            action: 'saveToListingAPI',
            item: bulkData
          });

          resolve(bulkData);
        } catch (error) {
          reject(error);
        }
      });
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