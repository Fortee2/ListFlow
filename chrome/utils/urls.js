export function getMercariURLs() {
    const urls = [
      {'type': 'inactive', 'url':'https://www.mercari.com/mypage/listings/inactive/?page=', 'activeListings': false}, 
      {'type': 'complete', 'url':'https://www.mercari.com/mypage/listings/complete/?page=', 'activeListings': false}, 
      {'type': 'active', 'url': 'https://www.mercari.com/mypage/listings/active/?page=', 'activeListings': true}, 
      {'type':'inprogress','url':'https://www.mercari.com/mypage/listings/in_progress/?page=', 'activeListings': false}
    ];
  
    return urls;
  }

  export function getMercariItemURL(){
    return 'https://www.mercari.com/sell/edit/';
  }
  
  export function getEbayURLs() {
    const urls = [
      {'type': 'active', 'url': 'https://www.ebay.com/sh/lst/active', 'activeListings': true}, 
      {'type': 'complete', 'url': 'https://www.ebay.com/sh/lst/ended', 'activeListings': false},
    ];  
  
    return urls;
  }

  export function getEtsyURLs() {
    const urls = [
      {'type': 'active', 'url': 'https://www.etsy.com/your/shops/thoughthemoondoor/tools/listings/sort:stock,order:ascending,view:table', 'activeListings': true}, 
      {'type': 'inactive', 'url': 'https://www.etsy.com/your/shops/thoughthemoondoor/tools/listings/state:inactive,view:table', 'activeListings': false},
      {'type': 'complete', 'url': 'https://www.etsy.com/your/shops/me/tools/listings/state:sold_out,view:table', 'activeListings': false},
    ];  
  
    return urls;
  }

  export function searchEtsyURLs(searchTerm) {
    let etsyURLs = getEtsyURLs();

    if(searchTerm === 'all') {
      return etsyURLs;
    }
    
    return etsyURLs.filter(x => x.type === searchTerm);
  }

  export function searchMercariURLs(searchTerm) {
    let mercariURLs = getMercariURLs();

    if(searchTerm === 'all') {
      return mercariURLs;
    }
    
    return mercariURLs.filter(x => x.type === searchTerm);
  }

  export function searchEbayURLs(searchTerm) {
    let ebayURLs = getEbayURLs();

    switch(searchTerm) {
      case 'active':
        searchTerm = 'active';
        break;
      case 'complete':
        searchTerm = 'complete';
        break;
      case 'inactive':
        searchTerm = 'inactive';
        break;
      default: //all
        return ebayURLs;
    }
    return ebayURLs.filter(x => x.type === searchTerm);
  }