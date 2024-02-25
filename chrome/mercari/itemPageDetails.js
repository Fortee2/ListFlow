export async function retrieveItemDetails(price){
    function checkReadyState() {
      return new Promise((resolve) => {
        if(document.readyState === 'complete') {
          console.log('readyState is complete');
          retrieveShipping().then(resolve);
        } else {
          console.log('readyState is not complete');
          setTimeout(() => checkReadyState().then(resolve), 1000);
        }
      });
    }
  
    function retrieveShipping(){
      return new Promise((resolve, reject) => {
        const shipping = document.querySelector('div[data-testid="ShippingPayerOption"]');
        if(shipping) {
          resolve(shipping.textContent);
        } else {
          resolve('No shipping information');
        }
      });
    }

    const shippingInfo = await checkReadyState();
    console.log(shippingInfo); // This will log the shipping information
    return shippingInfo; // This will return the shipping information from retrieveItemDetails function
  }