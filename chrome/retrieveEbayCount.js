function checkReadyState() {
    if(document.readyState === 'complete') {
      console.log('readyState is complete');
      readTotalItems();
    }else{
      console.log('readyState is not complete');
      setTimeout(checkReadyState, 1000 );
    }
  }

  function readTotalItems() {
    console.log('readTotalItems');
    const div = document.querySelector('span[class="result-range"]');
    console.log(div.innerHTML); 
    let count = div.innerHTML.split('of')[1].trim();
    console.log(count);
    chrome.runtime.sendMessage({ action: 'retrieveEbay', count: count, pageURL: 'https://www.ebay.com/sh/lst/active' });
  }

  checkReadyState();