export async function setSkuInDescription(itemNumber: string, mercariItem: string){
    function checkReadyState() {
      return new Promise<void>((resolve, reject) => {
        if(document.readyState === 'complete') {
          console.log('readyState is complete');
          setSku(); 
          resolve();
        } else {
          console.log('readyState is not complete');
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    }
  
    function setSku() { 
      const el = document.querySelector('[data-testid="Description"]') as HTMLTextAreaElement;
      
      if (el) {
        let description = el.value;
        if (description.length < 1000 - itemNumber.length - 4) {

          if(description.trimEnd().endsWith('['+ itemNumber +']')){
            chrome.runtime.sendMessage({ action: 'setSkuMercari'});
            return;
          }

          description = description + '\n ['+ itemNumber +']';
          
          // Focus the element first
          el.focus();
          
          // Set the value and trigger events
          setElementValue(el, description);
          
          // Small delay before clicking the button to allow React state to update
          setTimeout(() => {
            const button = document.querySelector('button[data-testid="ListButton"]') as HTMLButtonElement;
            if (button) {
              button.click();
            }
          }, 2000);
        }
      
        chrome.runtime.sendMessage({ action: 'updateDesc', desc: description, itemNumber: mercariItem});
        chrome.runtime.sendMessage({ action: 'setSkuMercari'});
      } else {
          console.error('Input field not found');
      }
    }

    function setElementValue(el: HTMLTextAreaElement, listingValue: string) 
    {
      if (el) {
          el.addEventListener('input', (e) => {
              console.log('input event fired');
              //console.log(e.target.value);
          });
          el.addEventListener('change', (e) => {
              console.log('change event fired');
              //console.log(e.target.value);
          });
          el.addEventListener('focus', (e) => {
              console.log('focus event fired');
              //console.log(e.target.value);
          });
          el.addEventListener('keydown', (e) => {
              console.log('keydown event fired');
              //console.log(e.target.value);
          });
          el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
          el.value = listingValue;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          let event = new KeyboardEvent('keydown', {bubbles: true,  key: 'Enter' });
          el.dispatchEvent(event);
      }
    }
  
    console.log('setMercariSku');
    await checkReadyState();
  }
