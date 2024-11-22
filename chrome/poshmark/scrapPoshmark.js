export function scrapPoshmarkData() {

  function checkReadyState() {
    return new Promise((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Page load timed out after 10 seconds'));
      }, 10000); // 10 seconds timeout

      function check() {
        if (document.readyState === 'complete') {
          clearTimeout(timeoutId);
          console.log('readyState is complete');
          parseListings().then(resolve()).catch((error) => console.log  (error)); 
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }

      check();
    });
  }

  function waitForPageLoad() {
    return new Promise((resolve, reject) => {
      let lastHeight = document.body.scrollHeight;
      let timeoutId;

      function checkForNewData() {
        // Scroll to the bottom of the page to trigger loading of new data
        window.scrollTo(0, document.body.scrollHeight);
        console.log('Scrolling'); // Use console.log instead of alert for debugging

        // Check if new data has been loaded
        setTimeout(() => {
          let newHeight = document.body.scrollHeight;
          if (newHeight > lastHeight) {
            // New data has been loaded, reset the timeout
            lastHeight = newHeight;
            clearTimeout(timeoutId);
            checkForNewData();
          } else {
            // No new data has been loaded, wait for a while and check again
            timeoutId = setTimeout(() => {
              resolve();
            }, 3000); // Wait for 3 seconds before considering the page fully loaded
          }
        }, 1000); // Check for new data every 1 second
      }

      checkForNewData();
    });
  }

  async function parseListings() {
    await waitForPageLoad();

    return new Promise((resolve, reject) => {
      try {
        const items = document.querySelectorAll('div[data-et-prop-location="listing_tile"]');
        
        const listings = Array.from(items).map(item => {
          const titleElement = item.querySelector('.title__condition__container a');
          const priceElement = item.querySelector('.p--t--1');
          const soldTagElement = item.querySelector('.sold-tag');
          const inactiveTagElement = item.querySelector('.not-for-sale-tag');
          
          if (!titleElement || !titleElement.innerText) {
            // Skip items with an undefined title
            return null;
          }

          return {
            itemTitle: titleElement ? titleElement.innerText : '',
            itemNumber: item.getAttribute('data-et-prop-listing_id'),
            description: "",
            salesChannel: 'Poshmark',
            active: soldTagElement == null ? true : false,
            listingDate: new Date().toISOString(),
            listingDateType: soldTagElement == null ? 0 : inactiveTagElement == null ? 1 : 2,
            views: "0",
            likes: "0",
            price: priceElement ? priceElement.innerText.replace('$', '') : '',
          };
        });

        chrome.runtime.sendMessage({action: "saveToListingAPI", item: listings});
        resolve(listings);
      } catch (error) {
        console.error('Error parsing listings:', error);
        reject(error);
      }
    });
  }

  checkReadyState().then(() => {
    parseListings().then(listings => {
      console.log('All listings:', listings);
    }).catch(error => {
      console.error('Error parsing listings:', error);
    });
  }).catch(error => {
    console.error('Error waiting for page load:', error);
  });

}