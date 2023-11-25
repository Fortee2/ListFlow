document.getElementById('eBayButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveEbay'});
});


document.getElementById('mercariNewButton').addEventListener('click', () => {
  let selectedStatus = getSelectedStatusValue();
  chrome.runtime.sendMessage({ action: 'retrieveNewMercari', listingType: selectedStatus, downloadImages: document.getElementById('downloadImages').checked });
});

function getSelectedStatusValue() {
  const selectedRadio = document.querySelector('input[name="status"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}