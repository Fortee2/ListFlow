document.getElementById('retrieveButton').addEventListener('click', () => {
  let selectedStatus = getSelectedStatusValue();
  let selectedSalesChannel = getSelectedSalesChannel();
  chrome.runtime.sendMessage({ action: 'retrieveSalesChannel', salesChannel: selectedSalesChannel, listingType: selectedStatus, downloadImages: document.getElementById('downloadImages').checked });
});

document.getElementById('openOptions').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});

document.getElementById('selectChannel').addEventListener('change', function() {
  let selectedOption = this.value;
  //TODO:  Add logic to show/hide the listing type select list
});

document.getElementById('snipeButton').addEventListener('click', () => {
  let itemNumber = document.getElementById('itemNumber').value;
  chrome.runtime.sendMessage({ action: 'migrateMercari', itemNumber: itemNumber});
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