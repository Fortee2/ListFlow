using ListFlow.Email.DTO;

namespace ListFlow.Email.Clients;

public class ListingClient
{
    private readonly ApiClient _client = new();
    private Dictionary<string, string> _titleLookup = new Dictionary<string, string>();
    public async Task<Listing[]?> GetListing(string listingId)
    {
        try{
            //This function throws an exception if the response is not successful
            var url = $"http://listflow-api.fenchurch.tech/api/Listing?ItemNumber={listingId}";
            var result = await _client.GetAsync<Listing[]>(url: url);

            return result;
        }catch(Exception e){
            Console.WriteLine(e.Message);
        }
        
        return null;
    }
    
    public async Task<Listing[]?> GetListingByTitle(string listingTitle, string salesChannel)
    {
        try{
            //This function throws an exception if the response is not successful
            var url = $"http://listflow-api.fenchurch.tech/api/Listing?ItemTitle={listingTitle}&SalesChannel={salesChannel}";
            var result = await _client.GetAsync<Listing[]>(url: url);

            return result;
        }catch(Exception e){
            Console.WriteLine(e.Message);
        }
        
        return null;
    }
    
    public async Task MarkSold(AuctionData auctionData, string salesChannel)
    {
        Listing[]? listing; 
            
        if(salesChannel == "eBay")
            listing = await GetListing(auctionData.ItemNumber).ConfigureAwait(false);
        else
            listing = await GetListingByTitle(auctionData.Title, salesChannel).ConfigureAwait(false);
        
        if (listing != null && listing.Any())
        {
            await UpdateSold(auctionData).ConfigureAwait(false);
            return;
        }

        await AddMissingSale(auctionData).ConfigureAwait(false);
    }

    public async Task AddMissingListing(AuctionData auctionData)
    {
        var listing = await GetListing(auctionData.ItemNumber).ConfigureAwait(false);
        var listings = new List<NewListing>();
        
        if (listing == null || !(listing.Length > 0))
        {

            var fullTitle = auctionData.Title;

           if(_titleLookup.TryGetValue(auctionData.Title, out var value))
           {
               if(! string.IsNullOrEmpty(value))
               {
                   fullTitle = value;
               }
                
           }
            
            var data = new NewListing{
                ItemNumber = auctionData.ItemNumber,
                ItemTitle = fullTitle, 
                ListingDate = auctionData.DateSold,
                Active = true,
                Description = auctionData.Title,
                SalesChannel = "eBay",
                ListingDateType = 0,
                Price = auctionData.Price,
            };
        
            listings.Add(data);


        }
        else
        {
            if(! _titleLookup.ContainsKey(auctionData.Title))
            {
                _titleLookup.Add(auctionData.Title, listing[0].ItemTitle);
            }

            if (listing[0].DateListed == null)
            {
                var data = new NewListing{
                    ItemNumber = listing[0].ItemNumber,
                    ItemTitle = listing[0].ItemTitle, 
                    ListingDate = auctionData.DateSold,
                    Active = listing[0].Active,
                    Description = listing[0].Description,
                    SalesChannel = "eBay",
                    ListingDateType = 0,
                    Price = listing[0].Price.ToString() ?? "",
                };
        
                listings.Add(data);
            }
            

        }
        
        try{
            if(listings.Count == 0)
            {
                return;
            }
            
            //This function throws an exception if the response is not successful
            var url = $"http://listflow-api.fenchurch.tech/api/BulkListing";
            await _client.PostAsync(url, listings).ConfigureAwait(false);
           
        }catch(Exception e){
            Console.WriteLine(e.Message);
        }
    }

    private async Task AddMissingSale(AuctionData auctionData)
    {
        var listings = new List<NewListing>();
        
        var data = new NewListing{
            ItemNumber = auctionData.ItemNumber,
            ItemTitle = auctionData.Title, 
            ListingDate = auctionData.DateSold,
            Active = false,
            Description = auctionData.Title,
            SalesChannel = "eBay",
            ListingDateType = 2,
            Price = auctionData.Price,
        };
        
        listings.Add(data);

        try{
            //This function throws an exception if the response is not successful
            var url = $"http://listflow-api.fenchurch.tech/api/BulkListing";
            await _client.PostAsync(url, listings).ConfigureAwait(false);
           
        }catch(Exception e){
            Console.WriteLine(e.Message);
        }
    }

    private async Task UpdateSold(AuctionData auctionData)
    {
        var data = new
        {
            soldDate = auctionData.DateSold.ToString("yyyy-MM-dd")
        };

        try{
            //This function throws an exception if the response is not successful
            var url = $"http://listflow-api.fenchurch.tech/api/listing/{auctionData.ItemNumber}/sold";
            await _client.PutAsync(url, data).ConfigureAwait(false);
           
        }catch(Exception e){
            Console.WriteLine(e.Message);
        }
    }
    
}