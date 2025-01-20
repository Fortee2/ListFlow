export async function endEbayListings(){
      
    const parseListings = async () => {
        let zeroItemCount = 0;
        const trs = Array.from(document.querySelectorAll('tr[class="grid-row"]'));

        for(const f of trs) {
            let qty = parseAvailableQuantity(f);
            let a = f.querySelector('div[class="column-title__text"]').querySelector('a');
            let itemNumber = a.href.split('/')[4];

            console.log('found an item with qty: ', qty);
            if(qty == '0'){
                zeroItemCount++;
                f.querySelector(`input[id="shui-dt-checkone-${itemNumber}"]`).focus();
                f.querySelector(`input[id="shui-dt-checkone-${itemNumber}"]`).click();
                
                do{
                    await delay(1000);
                }while(!f.querySelector(`input[id="shui-dt-checkone-${itemNumber}"]`).checked);
            }
        }

        if(zeroItemCount){
            await endListings();
        }
    }

    function parseAvailableQuantity(element) {
        try{
            const availableQuantityElement = element.querySelector(
                'td[class="shui-dt-column__availableQuantity shui-dt--right editable inline-editable"]'
            ).querySelector('div[class="shui-dt--text-column"]').querySelector('div');
        
            return availableQuantityElement ? availableQuantityElement.innerText : null;
        }catch(e){
            console.log(e);
            return "0";
        }
    }

    const checkReadyState = async () => {
        return new Promise((resolve) => {
          if(document.readyState === 'complete') {
            console.log('readyState is complete');
            parseListings().then(resolve);
          }else{
            console.log('readyState is not complete');
            setTimeout(() => checkReadyState().then(resolve), 1000);
          }
        });
      } 

    const endListings = async () => {
        let buttonClicked = false;
        let loopCount = 0;
        let endListingDiv = null;
  
        try{
          do {
            const actionButton = document.querySelectorAll('div[class="action-btn"]')[2].querySelector('button');
  
            if (actionButton && !buttonClicked) {
              actionButton.focus();
              actionButton.click();
              buttonClicked = true;
            }
  
            console.log('buttonClicked', buttonClicked);
            if (buttonClicked) {
                await delay(3000);  
                const endButton = document.querySelectorAll('ul[class="fake-menu__items"]')[3].querySelectorAll('li')[0].getElementsByTagName('button')[0];
                endButton.focus();
                endButton.click();

                endListingDiv = document.querySelector('div[class="se-end-listing__footer-actions"]');

                console.log(endListingDiv);
                
                if (endListingDiv != null) {
                    endListingDiv.querySelector('button[class="btn btn--primary"]').focus();
                    endListingDiv.querySelector('button[class="btn btn--primary"]').click();
                }
            }
  
            await delay(3000);            
            loopCount++;
          } while (endListingDiv == null && loopCount < 5);
        }catch(e){
          console.log(e);
        }
    }

    async function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    await checkReadyState();
};