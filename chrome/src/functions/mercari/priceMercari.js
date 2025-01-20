export async function correctPriceMercari(price){
    function checkReadyState() {
      return new Promise((resolve, reject) => {
        if(document.readyState === 'complete') {
          console.log('readyState is complete');
          setPrice(price); 
          resolve();
        } else {
          console.log('readyState is not complete');
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    }
  
    function setPrice(price) { 
      const el = document.querySelector('input[name="sellPrice"]');
      if (el) {
          el.addEventListener('input', (e) => {
              console.log('input event fired');
              console.log(e.target.value);
          });
          el.addEventListener('change', (e) => {
              console.log('change event fired');
              console.log(e.target.value);
          }); 
          el.addEventListener('focus', (e) => {
              console.log('focus event fired');
              console.log(e.target.value);
          });
          el.addEventListener('keydown', (e) => { 
              setTimeout(() => {
                document.querySelector('button[data-testid="ListButton"]').click();
              }, 2000);
          
              console.log('keydown event fired');
              console.log(e.target.value);
          });
          el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
          el.value = parseFloat(price);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          
          let event = new KeyboardEvent('keydown', {bubbles: true,  key: 'Enter' });
          el.dispatchEvent(event);
          console.log(price);
      } else {
          console.error('Input field not found');
      }
    }
  
    console.log('correctPriceMercari');
    await checkReadyState();
  }
  