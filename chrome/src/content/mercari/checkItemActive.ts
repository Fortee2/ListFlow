export async function checkItemActive(itemNumber: string){
  function checkReadyState() {
    return new Promise<void>((resolve, reject) => {
      if(document.readyState === 'complete') {
        console.log('readyState is complete');
        setInactive(); 
        resolve();
      } else {
        console.log('readyState is not complete');
        setTimeout(() => checkReadyState().then(resolve), 1000);
      }
    });
  }
  
  function isNotFoundPage() {
    return document.body.innerText.includes('404 error - Not found') 
        || document.body.innerText.includes('Sorry this page couldn\'t be found');
  }

  function setInactive() {
    if (isNotFoundPage()) {
      chrome.runtime.sendMessage({ action: 'setInactive', itemNumber: itemNumber });
    }
  }

  const shippingInfo = await checkReadyState();
  console.log(shippingInfo); // This will log the shipping information
  return shippingInfo; // This will return the shipping information from retrieveItemDetails function
}