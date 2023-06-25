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

            divs.forEach(
              f=>{
                const ele = f.querySelector('a'); 
                console.log(ele.innerHTML);
              }
            );
          }

          checkReadyState();
        },
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  }
});


async function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.create({ url: 'https://www.mercari.com/mypage/listings/active/?sortBy=1&page=13' }, function(tab) {
      resolve(tab);
    });
  });
}
