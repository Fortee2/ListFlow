document.getElementById('mercariButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveCount' });
});

document.getElementById('eBayButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveEbay'});
});
