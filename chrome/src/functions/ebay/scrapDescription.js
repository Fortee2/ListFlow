export async function scrapEbayDescriptions(itemNumber) {
  
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
            retrieveDescription(); 
            resolve();
          } else {
            console.log('readyState is not complete');
            setTimeout(check, 1000);
          }
        }
    
        check();
      });
      
    }
  
    function retrieveDescription() {
      return new Promise((resolve, reject) => {
        try{
          function checkDescElement() {
              let descElement = document.querySelector('div[data-testid="x-item-description-child"]');
              console.log('retrieveDescription');
              console.log(descElement); 
              if (descElement) {
                chrome.runtime.sendMessage({ action: 'updateDesc', desc: descElement.innerText, item: itemNumber});
                resolve();
            } else {
              setTimeout(checkDescElement, 1000); // wait for 1 second before checking again
            }
          }
          checkDescElement();
        }catch(e){
          console.log(e);
          reject();   
        }
      });
    }
  
    console.log('scrapEbayDescriptions');
    await checkReadyState();
  }