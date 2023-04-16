let pollServerButton = document.getElementById('pollServer');

function pollServer() {
    const serverURL = 'https://localhost:7219/api/Ebay';
  
    fetch(serverURL)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
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
      });
  }

pollServerButton.addEventListener('click', () => {
    pollServer();
});