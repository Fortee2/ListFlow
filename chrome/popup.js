document.getElementById('mercariButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveCount' });
});

document.getElementById('mCompletedButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveCompletedCount' });
});