import ListItem from "../domain/IListItem";
import MessageRequest from "../domain/MessageRequest";
import IStorageData from "../domain/IStorageData";


// DOM Elements
const retrieveButton = document.getElementById('retrieveButton') as HTMLButtonElement;
const optionsButton = document.getElementById('openOptions') as HTMLButtonElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
const selectType = document.getElementById('selectType') as HTMLSelectElement;
const selectChannel = document.getElementById('selectChannel') as HTMLSelectElement;
const selectListing = document.getElementById('selectListing') as HTMLSelectElement;
const selectDestination = document.getElementById('selectDestination') as HTMLSelectElement;
const downloadImagesCheckbox = document.getElementById('downloadImages') as HTMLInputElement;

// Event Listeners
retrieveButton.addEventListener('click', () => {
  const selectedStatus = getSelectedStatusValue();
  const selectedSalesChannel = getSelectedSalesChannel();
  chrome.runtime.sendMessage({ 
    action: 'retrieveSalesChannel', 
    salesChannel: selectedSalesChannel, 
    listingType: selectedStatus, 
    downloadImages: downloadImagesCheckbox.checked 
  } as MessageRequest);
});

optionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

copyButton.addEventListener('click', () => {
  const destinationSalesChannel = getDestinationSalesChannel();
  const itemNumber = selectListing.value;
  chrome.runtime.sendMessage({ 
    action: 'copyListing', 
    itemNumber: itemNumber, 
    salesChannel: destinationSalesChannel
  } as MessageRequest);
});

function getSelectedStatusValue(): string {
  return selectType.selectedOptions[0].value;
}

function getSelectedSalesChannel(): string {
  return selectChannel.selectedOptions[0].value;
}

function getDestinationSalesChannel(): string {
  return selectDestination.selectedOptions[0].value;
}


function retrieveFromServer(): void {
  chrome.storage.sync.get(['serverURI'], (result: IStorageData) => {
    if (!result.serverURI) return;

    fetch(`${result.serverURI}/api/Listing/toCrossPost`)
      .then(response => response.json())
      .then((data: ListItem[]) => {
        // Store the fetched data in chrome.storage for future use
        console.log(data);
        chrome.storage.sync.set({listData: data}, () => {
          console.log('Data saved to storage');
        });

        // Populate the dropdown with the fetched data
        populateDropdown(data);
      })
      .catch(error => console.error('Error:', error));
  });
}

function populateDropdown(data: ListItem[]): void {
  // Clear existing options
  while (selectListing.firstChild) {
    selectListing.removeChild(selectListing.firstChild);
  }

  // Populate the dropdown with the data
  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item.itemNumber;
    option.text = item.title;
    selectListing.add(option);
  });
}

// Initialize on window load
window.addEventListener('load', () => {
  chrome.storage.sync.get(['listData'], (result: IStorageData) => {
    if (result.listData) {
      if (result.listData.length > 3) {
        // If the data is already stored, load it from chrome.storage
        populateDropdown(result.listData);
      } else {
        retrieveFromServer();
      }
    } else {
      retrieveFromServer();
    }
  });
});
