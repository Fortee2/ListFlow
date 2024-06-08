document.getElementById('options-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const preference1 = document.getElementById('serverURI').value;
  const preference2 = document.getElementById('createListingExports').checked;
  const preference3 = document.getElementById('updatePrice').checked;
  const preference4 = document.getElementById('RemoveInactiveListings').checked;

  chrome.storage.sync.set({ serverURI: preference1 }, function() {
    console.log('Preferences saved.');
  });

  chrome.storage.sync.set({ createExport: preference2 }, function() {
    console.log('Preferences saved.');
  });

  chrome.storage.sync.set({ updatePrice: preference3  }, function() {
    console.log('Preferences saved.');
  });

  chrome.storage.sync.set({ RemoveInactiveListings: preference4  }, function() {
    console.log('Preferences saved.');
  });
});

document.getElementById('close').addEventListener('click', function() {
  window.close();
});

window.onload = function() {
    chrome.storage.sync.get('serverURI', function(data) {
      document.getElementById('serverURI').value = data.serverURI;
    });

    chrome.storage.sync.get('createExport', function(data) {
      document.getElementById('createListingExports').checked = data.createExport;
    });

    chrome.storage.sync.get('updatePrice', function(data) {
      document.getElementById('updatePrice').checked = data.updatePrice;
    });

    chrome.storage.sync.get('RemoveInactiveListings', function(data) {
      document.getElementById('RemoveInactiveListings').checked = data.RemoveInactiveListings;
    });
}