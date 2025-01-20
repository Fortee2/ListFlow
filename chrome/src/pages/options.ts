const form = document.getElementById('options-form');

if (!form) throw new Error('Form element not found');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const serverURIElem = document.getElementById('serverURI')! as HTMLInputElement;
  const preference1 = serverURIElem.value;
  const createListingExportsElem = document.getElementById('createListingExports')! as HTMLInputElement; 
  const preference2 = createListingExportsElem.checked === true;
  const updatePriceElem = document.getElementById('updatePrice')! as HTMLInputElement;
  const preference3 = updatePriceElem.checked === true; 
  const removeInactiveListingsElem = document.getElementById('RemoveInactiveListings')! as HTMLInputElement;
  const preference4 = removeInactiveListingsElem.checked === true;

  chrome.storage.sync.set({ serverURI: preference1 }, function() {
    console.log(preference1);
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

const closeButton = document.getElementById('close');
if (closeButton) {
  closeButton.addEventListener('click', function() {
    window.close();
  });
}

const clearButton = document.getElementById('clear');
if (clearButton) {
  clearButton.addEventListener('click', function() {
    chrome.storage.sync.set({listData: []}, function() {   
    });
  });
}


window.onload = function() {
    chrome.storage.sync.get('serverURI', function(data) {
      (document.getElementById('serverURI') as HTMLInputElement).value = data.serverURI;
    });

    chrome.storage.sync.get('createExport', function(data) {
      (document.getElementById('createListingExports') as HTMLInputElement).checked = data.createExport;
    });

    chrome.storage.sync.get('updatePrice', function(data) {
      (document.getElementById('updatePrice') as HTMLInputElement).checked = data.updatePrice;
    });

    chrome.storage.sync.get('RemoveInactiveListings', function(data) {
      (document.getElementById('RemoveInactiveListings') as HTMLInputElement).checked = data.RemoveInactiveListings;
    });
}
