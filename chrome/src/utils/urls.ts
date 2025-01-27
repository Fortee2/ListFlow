import { ISiteUrls } from "../domain/ISiteUrls";
import IUrlResult from "../domain/IUrlResult";

  export function getMercariItemURL(){
    return 'https://www.mercari.com/sell/edit/';
  }
  
  export function getEbayURLs() {
    const urls = [
      {'type': 'active', 'url': 'https://www.ebay.com/sh/lst/active', 'activeListings': true}, 
      {'type': 'complete', 'url': 'https://www.ebay.com/sh/lst/ended?status=SOLD&timePeriod=LAST_90_DAYS&source=filterpanel&action=search', 'activeListings': false},
      {'type': 'inactive', 'url': 'https://www.ebay.com/sh/lst/ended?status=UNSOLD_NOT_RELISTED&timePeriod=LAST_90_DAYS&source=filterpanel&action=search', 'activeListings': false},
    ];  
  
    return urls;
  }

  export function getEtsyURLs() {
    const urls: IUrlResult[] = [
      {'type': 'active', 'url': 'https://www.etsy.com/your/shops/thoughthemoondoor/tools/listings/sort:stock,order:ascending,view:table', 'activeListings': true}, 
      {'type': 'inactive', 'url': 'https://www.etsy.com/your/shops/thoughthemoondoor/tools/listings/state:inactive,view:table', 'activeListings': false},
      {'type': 'complete', 'url': 'https://www.etsy.com/your/shops/me/tools/listings/state:sold_out,view:table', 'activeListings': false},
    ];  
  
    return urls;
  }

  export function getPoshmarkURLs() {
    const urls: IUrlResult[] = [
      {'type': 'active', 'url': 'https://poshmark.com/vm-rest/users/yanciecostner/posts/filtered?request=%7B%22filters%22%3A%7B%22department%22%3A%22All%22%2C%22inventory_status%22%3A%5B%22all%22%5D%7D%2C%22facets%22%3A%5B%22brand%22%2C%22color%22%2C%22department%22%5D%2C%22experience%22%3A%22all%22%2C%22count%22%3A500%7D&summarize=true&app_version=2.55&pm_version=2024.41.1', 'activeListings': true},
    ];

    return urls;
  }

  export function searchEtsyURLs(searchTerm:string) {
    let etsyURLs = getEtsyURLs();

    if(searchTerm === 'all') {
      return etsyURLs;
    }
    
    return etsyURLs.filter(x => x.type === searchTerm);
  }



  export function searchEbayURLs(searchTerm:string) {
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

  export class Urls {
    private readonly urlData: ISiteUrls[] = [
        {marketplace: "facebook",
            createUrl: "https://www.facebook.com/marketplace/create/item",
            scrapUrls: []
        },
        {marketplace: "mercari",
            createUrl: "https://www.mercari.com/sell/",
            scrapUrls: [
              {'type': 'inactive', 'url':'https://www.mercari.com/mypage/listings/inactive/?page=', 'activeListings': false}, 
              {'type': 'complete', 'url':'https://www.mercari.com/mypage/listings/complete/?page=', 'activeListings': false}, 
              {'type': 'active', 'url': 'https://www.mercari.com/mypage/listings/active/?page=', 'activeListings': true}, 
              {'type':'inprogress','url':'https://www.mercari.com/mypage/listings/in_progress/?page=', 'activeListings': false}
            ]
        }
    ];

    public searchMercariURLs(searchTerm:string): IUrlResult[] {
      let mercariURLs = this.urlData.find(x => x.marketplace === 'mercari')?.scrapUrls ?? [];
  
      if(searchTerm === 'all') {
        return mercariURLs;
      }
      
      return mercariURLs.filter(x => x.type === searchTerm);
    }
    
    public GetCreateUrl(marketplace: string): string { 
      return this.urlData.find(x => x.marketplace === marketplace)?.createUrl ?? '';
    }
  }
