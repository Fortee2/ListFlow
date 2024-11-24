import ListingDescriptionPrompt from './ListingDescriptionPrompt';

if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL is not defined');
}

const API_URL = process.env.REACT_APP_API_URL;

export function fetchListingDescription(data: ListingDescriptionPrompt) {
  return fetch(`${API_URL}/Prompt`, {
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
