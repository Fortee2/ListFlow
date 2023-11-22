export function getMercariURLs() {
    const urls = [
      {'type': 'inactive', 'url':'https://www.mercari.com/mypage/listings/inactive/?page=', 'activeListings': false}, 
      {'type': 'complete', 'url':'https://www.mercari.com/mypage/listings/complete/?page=', 'activeListings': false}, 
      {'type': 'active', 'url': 'https://www.mercari.com/mypage/listings/active/?page=', 'activeListings': true}, 
      {'type':'inprogress','url':'https://www.mercari.com/mypage/listings/in_progress/?page=', 'activeListings': false}
    ];
  
    return urls;
  }
  
  export function getEbayURLs() {
    const urls = [
      {'type': 'active', 'url': 'https://www.ebay.com/sh/lst/active', 'activeListings': true}, 
      {'type': 'inactive', 'url': 'https://www.ebay.com/sh/lst/ended', 'activeListings': false},
    ];  
  
    return urls;
  }

  export function searchMercariURLs(searchTerm) {
    let mercariURLs = getMercariURLs();

    return mercariURLs.filter(x => x.type === searchTerm);
  }