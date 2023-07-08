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
    const div = document.querySelectorAll('h5[data-testid="FilterCount"]');
    console.log(div[5].innerHTML); 
    chrome.runtime.sendMessage({ action: 'retrieveMercari', count: div[5].innerHTML, pageURL: 'https://www.mercari.com/mypage/listings/complete/?page=' });
  }

  checkReadyState();