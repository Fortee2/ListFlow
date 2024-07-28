document.getElementById('retrieveButton').addEventListener('click', () => {
  let selectedStatus = getSelectedStatusValue();
  let selectedSalesChannel = getSelectedSalesChannel();
  chrome.runtime.sendMessage({ action: 'retrieveSalesChannel', salesChannel: selectedSalesChannel, listingType: selectedStatus, downloadImages: document.getElementById('downloadImages').checked });
});

document.getElementById('openOptions').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});

document.getElementById('copyButton').addEventListener('click', () => {
  let selectedSalesChannel = getSelectedSalesChannel();
  let itemNumber = document.getElementById('selectListing').value;
  chrome.runtime.sendMessage({ action: 'copyListing', itemNumber: itemNumber, salesChannel: selectedSalesChannel});
});

function getSelectedStatusValue() {
  const selectList = document.getElementById('selectType');
  const isSelected = selectList.selectedOptions[0].value;
  return isSelected;
}

function getSelectedSalesChannel() {
  const selectList = document.getElementById('selectChannel');
  const isSelected = selectList.selectedOptions[0].value;
  return isSelected;
}

window.onload = function() {
  //retrieveFromServer();
  // Try to load the data from chrome.storage
  chrome.storage.sync.get(['listData'], function(result) {
    if (result.listData) {
      if(result.listData.length > 3) {
        // If the data is already stored, load it from chrome.storage
        populateDropdown(result.listData);
        return;
      } else {
        retrieveFromServer();
      }
    } else {
     retrieveFromServer();
    } 
  });
};

function retrieveFromServer() {
   // If the data is not stored, fetch it from the API
   chrome.storage.sync.get(['serverURI'], function(result) {
    fetch(`${result.serverURI}/api/Listing/toCrossPost`)
      .then(response => response.json())
      .then(data => {
        // Store the fetched data in chrome.storage for future use
        console.log(data);
        chrome.storage.sync.set({listData: data}, function() {   
      });

        // Populate the dropdown with the fetched data
        populateDropdown(data);
      })
      .catch(error => console.error('Error:', error));
  });
}

function populateDropdown(data) {
  // Get the dropdown element
  const dropdown = document.getElementById('selectListing');

  // Populate the dropdown with the data
  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.itemNumber;
    option.text = item.title;
    dropdown.add(option);
  });
}