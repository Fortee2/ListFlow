function sendMessageWithPromise(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, function(response) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

document.getElementById('mercariButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveCount' });
});

document.getElementById('eBayButton').addEventListener('click', () => {
  sendMessageWithPromise({ action: 'retrieveEbayCount' }).then((countResponse) => {
    console.log("Total Item Count: " + countResponse);
   
    
  }).catch((error) => {
    console.error(error);
  });
});
