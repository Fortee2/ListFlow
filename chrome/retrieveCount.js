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
    let counts = [div[0].innerHTML , div[1].innerHTML, div[4].innerHTML, div[5].innerHTML];
    chrome.runtime.sendMessage({ action: 'retrieveMercari', countData: counts});
  }

  checkReadyState();