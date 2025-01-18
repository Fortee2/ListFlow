const form = document.getElementById('options-form');

if (!form) throw new Error('Form element not found');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const serverURIElem = document.getElementById('serverURI')!;
  const preference1 = serverURIElem.getAttribute('value')!;
  const createListingExportsElem = document.getElementById('createListingExports')!; 
  const preference2 = createListingExportsElem.getAttribute('checked') === 'true';
  const updatePriceElem = document.getElementById('updatePrice')!;
  const preference3 = updatePriceElem.getAttribute('checked') === 'true'; 
  const removeInactiveListingsElem = document.getElementById('RemoveInactiveListings')!;
  const preference4 = removeInactiveListingsElem.getAttribute('checked') === 'true';

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
      document.getElementById('serverURI')?.setAttribute('value', data.serverURI);
    });

    chrome.storage.sync.get('createExport', function(data) {
      document.getElementById('createListingExports')?.setAttribute('checked', data.createExport);
    });

    chrome.storage.sync.get('updatePrice', function(data) {
      document.getElementById('updatePrice')?.setAttribute('checked',data.updatePrice);
    });

    chrome.storage.sync.get('RemoveInactiveListings', function(data) {
      document.getElementById('RemoveInactiveListings')?.setAttribute('checked', data.RemoveInactiveListings);
    });
}
