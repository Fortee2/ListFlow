class AuctionDetails {
   addAuctionDetailsToStorage(auctionDetail) {
        

        chrome.storage.local.get(['auctionDetails'], function(data) {
            let auctionDetails = [];
            if (data.auctionDetails){
                auctionDetails = data.auctionDetails;
            }
            
            auctionDetails.push(auctionDetail);
            chrome.storage.local.set({'auctionDetails': auctionDetails});
        });

        
   }
}

export default AuctionDetails;