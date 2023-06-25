chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'retrieveMercari') {
    try {
      const tab = await getActiveTab();
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: function likeAndRepostForKingsmen() {
          function checkReadyState() {
            if(document.readyState === 'complete') {
              console.log('readyState is complete');
              retrieveMercari();
            }else{
              console.log('readyState is not complete');
              setTimeout(checkReadyState, 1000 );
            }
          }

          function retrieveMercari() {
            console.log('retrieveMercari');
            const divs = document.querySelectorAll('div[data-testid="RowItemWithMeta"]');

            console.log(divs.length); 

            let data = [];

            divs.forEach(
              f=>{
                const ele = f.querySelector('a'); 
                data.push(ele.innerHTML);
              }
            );

            chrome.runtime.sendMessage({ action: 'downloadData', data: data.join('\n') });
          }

          checkReadyState();
        },
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
  else  if (request.action === 'downloadData') {
    const blob = new Blob([request.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: 'data.txt'
    });
  }
});

async function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: 'https://www.mercari.com/mypage/listings/active/?sortBy=1&page=13' }, function(tab) {
      resolve(tab);
    });
  });
}
