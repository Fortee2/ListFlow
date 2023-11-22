document.getElementById('mercariButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveMercari' });
});

document.getElementById('eBayButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'retrieveEbay'});
});


document.getElementById('mercariNewButton').addEventListener('click', () => {
  let selectedStatus = getSelectedStatusValue();
  chrome.runtime.sendMessage({ action: 'retrieveNewMercari', listingType: selectedStatus });
});

function getSelectedStatusValue() {
  const radios = document.querySelectorAll('input[name="status"]');
  let selectedValue;
  for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
          selectedValue = radios[i].value;
          break;
      }
  }
  return selectedValue;
}