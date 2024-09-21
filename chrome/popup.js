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

document.getElementById('addBidButton').addEventListener('click', function() {
  // Get the current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;

    if (!currentUrl.includes('shopgoodwill')) {
      alert('This feature only works on Goodwill pages.');
      return;
    }
    
    chrome.runtime.sendMessage({ action: 'goodwillAuctionDetails', url: currentUrl });

  });
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
  chrome.storage.sync.get(['listData'], function(result) {
    if (result.listData) {
      if(result.listData.length > 3) {
        // If the data is already stored, load it from chrome.storage
        populateDropdown(result.listData);
      } else {
        retrieveFromServer();
      }
    } else {
     retrieveFromServer();
    } 
  });

   // Retrieve auctionDetails from chrome.storage
   chrome.storage.sync.get(['auctionDetails'], function(data) {
    if (data.auctionDetails) {
      console.log("Retrieved auction details:", data.auctionDetails);
      // Use the retrieved auction details as needed
      for (const auctionDetail of data.auctionDetails) {
        console.log(auctionDetail);
        const bidList = document.getElementById('bidList');
        const bidItem = document.createElement('div');
        bidItem.textContent = `URL: <a href='${auctionDetail.url}'>${auctionDetail.itemTitle}</a> Max Bid: $${auctionDetail.maxBid}`;
        bidList.appendChild(bidItem);
      }
    } else {
      console.log("No auction details found in chrome.storage");
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