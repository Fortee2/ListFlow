import  ListingDescriptionPrompt  from './ListingDescriptionPrompt';

export  function fetchListingDescription(data:ListingDescriptionPrompt) {
   return  fetch('http://localhost:5227/api/Prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
    .then(data => {
        return data.content;
    });
    
}
  