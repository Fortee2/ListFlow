export async function scrapEbayPostage(itemNumber) {
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
            retrievePostage(); 
            resolve();
          } else {
            console.log('readyState is not complete');
            setTimeout(check, 1000);
          }
        }
    
        check();
      });
    }
  
    function retrievePostage() {
      return new Promise((resolve, reject) => {
        function checkPostageElement() {
            try{
                let majorElement = document.querySelector('input[name="majorWeight"]');
                let minorElement = document.querySelector('input[name="minorWeight"]');
                let packageLength = document.querySelector('input[name="packageLength"]');
                let packageWidth = document.querySelector('input[name="packageWidth"]');
                let packageHeight = document.querySelector('input[name="packageDepth"]');
    
                console.log('majorElement');
                console.log(majorElement);
                console.log('minorElement');
                console.log(minorElement);
                console.log('packageLength');
                console.log(packageLength);
                console.log('packageWidth');
                console.log(packageWidth);
                console.log('packageHeight');
                console.log(packageHeight);

                if (majorElement) {
                    console.log('retrievePostage');
                    console.log(majorElement.innerText);
                    chrome.runtime.sendMessage({ 
                        action: 'queueEbayPostage', 
                        majorElement: majorElement.value === '' ? 0 : majorElement.value, 
                        minorElement: minorElement.value === '' ? 0 : minorElement.value,
                        packageLength: packageLength.value === '' ? 0 : packageLength.value,
                        packageWidth: packageWidth.value === '' ? 0 : packageWidth.value,
                        packageHeight: packageHeight.value === '' ? 0 : packageHeight.value,
                        item: itemNumber});
                    resolve();
                } else {
                    setTimeout(checkPostageElement, 1000); // wait for 1 second before checking again
                }
            }catch(e){
                console.log(e);
                reject();   
            }
            
        }
        checkPostageElement();
      })
    }
    
    await checkReadyState();
}