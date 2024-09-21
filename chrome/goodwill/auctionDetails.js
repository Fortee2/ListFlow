class AuctionDetails {
   addAuctionDetailsToStorage(auctionDetail) {
        let auctionDetails = [];

        chrome.storage.sync.get({
            auctionDetails: [],
        }, function(data) {
            auctionDetails = data.auctionDetails;
        });

        auctionDetails.push(auctionDetail);

        chrome.storage.sync.set({auctionDetails: auctionDetails}, function() {
            console.log("Auction details stored in chrome.storage");
        });
   }
}

export default AuctionDetails;