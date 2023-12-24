document.getElementById('retrieveButton').addEventListener('click', () => {
  let selectedStatus = getSelectedStatusValue();
  let selectedSalesChannel = getSelectedSalesChannel();
  chrome.runtime.sendMessage({ action: 'retrieveSalesChannel', salesChannel: selectedSalesChannel, listingType: selectedStatus, downloadImages: document.getElementById('downloadImages').checked });
});

document.getElementById('openOptions').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});

document.getElementById('selectList').addEventListener('change', function() {
  let selectedOption = this.value;
  let inprogressRadioButton = document.getElementById('inprogress');
  let inactiveRadioButton = document.getElementById('inactive');
  let inprogressLabel = inprogressRadioButton.previousElementSibling;
  let inactiveLabel = inactiveRadioButton.previousElementSibling;

  if (selectedOption === 'eBay') {
    inprogressRadioButton.style.display = 'none';
    inactiveRadioButton.style.display = 'none';
    inprogressLabel.style.display = 'none';
    inactiveLabel.style.display = 'none';
  } else {
    inprogressRadioButton.style.display = '';
    inactiveRadioButton.style.display = '';
    inprogressLabel.style.display = '';
    inactiveLabel.style.display = '';
  }
});

function getSelectedStatusValue() {
  const selectedRadio = document.querySelector('input[name="status"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

function getSelectedSalesChannel() {
  const selectList = document.getElementById('selectList');
  const isSelected = selectList.selectedOptions[0].value;
  return isSelected;
}