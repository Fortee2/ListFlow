document.getElementById('mercariButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveCount' });
});