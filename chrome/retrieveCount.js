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
    const div = document.querySelector('h5[data-testid="FilterCount"]');
    console.log(div.innerHTML); 
    chrome.runtime.sendMessage({ action: 'retrieveMercari', count: div.innerHTML, pageURL: 'https://www.mercari.com/mypage/listings/active/?page=' });
  }

  checkReadyState();