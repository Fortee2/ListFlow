async function openURL(url, textareaId, content) {
    const tab = await chrome.tabs.create({ url: url });
  
    function executeScriptAndSendMessage(tabId) {
      chrome.scripting.executeScript(
        { target: { tabId: tabId }, files: ['content.js'] },
        () => {
          chrome.tabs.sendMessage(tabId, {
            type: 'populateTextarea',
            textareaId: textareaId,
            content: content,
          });
        }
      );
    }
  
    if (tab.status === 'complete') {
      executeScriptAndSendMessage(tab.id);
    } else {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          executeScriptAndSendMessage(tabId);
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }
  }
  
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'openURL') {
      openURL(request.url, request.textareaId, request.content);
    }
  });
  
  function pollServer() {
    const serverURL = 'https://your-dotnet-server.com/api/endpoint';
  
    fetch(serverURL)
      .then((response) => response.json())
      .then((data) => {
        if (data.signal) {
          chrome.runtime.sendMessage({
            type: 'openURL',
            url: data.url,
            textareaId: data.textareaId,
            content: data.content
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
     // })
     // .finally(() => {
      //  setTimeout(pollServer, 5000); // Poll every 5 seconds
      });
  }
  
  pollServer();
  