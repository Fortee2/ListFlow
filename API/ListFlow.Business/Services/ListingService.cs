using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.DTO;
using ListFlow.Business.Enums;
using System.Reflection.Metadata;

namespace ListFlow.Business.Services
{

    public class ListingService : IListingService
    {
        private readonly IListingRepository _listings;
        private readonly ISalesChannelRepository _salesChannels;
        private readonly IListingMetricRepository _listingMetrics;

        public ListingService(IListingRepository listingRepository, ISalesChannelRepository salesChannelRepository, IListingMetricRepository listingMetricRepository){
            _listings = listingRepository;
            _listingMetrics = listingMetricRepository;
            _salesChannels = salesChannelRepository;
        }

        public async Task<ServiceResult<Listing>> Create(ListingDTO listing)
        {
            // Check if a channel with the same name already exists
            var existing = _listings.FindByTitle(listing.ItemTitle.ToLower());
            if ( existing != null)
            {
                existing.ItemNumber = listing.ItemNumber;
                UpdateListing(existing, listing);
                return new ServiceResult<Listing>(existing);
            }

            var salesChannel = _salesChannels.FindByName(listing.SalesChannel);

            if (salesChannel == null)
            {
                return new ServiceResult<Listing>("The Sales Channel associated with this listing does not exist.");
            }

            var newListing = new Listing
            {
                Id = Guid.NewGuid(),
                ItemTitle = listing.ItemTitle,
                ItemNumber = listing.ItemNumber,
                Description = listing.Description,
                SalesChannel = salesChannel,
                Active = listing.Active,
                Price = listing.ConvertedPrice
            };

            await _listings.AddAsync(newListing);

            return new ServiceResult<Listing>(newListing);
        }

        public async Task CreateListings(ListingDTO[] listings)
        {
            List<Listing> newListings = new();

            if (!listings.Any())
            {
                return;
            }

            //Listings are grouped by sales channel, so we only need to check the first one
            var salesChannel = _salesChannels.FindByName(listings[0].SalesChannel);

            if (salesChannel == null)
            {
                return; // new ServiceResult<Listing[]>("The Sales Channel associated with these listings does not exist.");
            }

            foreach (var listingDto in listings)
            {
                var existing = _listings.FindByItemNumber(listingDto.ItemNumber);

                if (existing == null)
                {
                    var newListing = new Listing
                    {
                        Id = Guid.NewGuid(),
                        ItemTitle = listingDto.ItemTitle,
                        ItemNumber = listingDto.ItemNumber,
                        Description = listingDto.Description,
                        SalesChannel = salesChannel,
                        Active = listingDto.Active,
                        DateSold = listingDto.SoldDate,
                        DateListed = listingDto.ListedDate,
                        DateEnded = listingDto.EndedDate,
                        Price = listingDto.ConvertedPrice,
                        LastUpdated = DateTime.Now
                    };

                    newListings.Add(newListing);
                    continue;
                }
                
                UpdateListing(existing, listingDto);
            }
            
            await _listings.AddRangeAsync(newListings);


            return; // new ServiceResult<Listing[]>(newListings.ToArray());
        }

        public async Task CreateMetrics(ListingDTO[] listingDtos){
            List<ListingMetric> newMetrics = new List<ListingMetric>();

            foreach (var listingDto in listingDtos){
                var existing = _listings.FindByItemNumber(listingDto.ItemNumber);
                if ( existing == null)
                {
                    continue;
                }

                var existingMetric = _listingMetrics.FindByItemNumber(listingDto.ItemNumber);

                if(existingMetric == null){
                    newMetrics.Add(new ListingMetric
                    {
                        Id = Guid.NewGuid(),
                        Listing = existing,
                        Views = listingDto.ConvertedViews,
                        Likes = listingDto.ConvertedLikes,
                        LastUpdated = DateTime.Now,
                    });

                    continue;
                }

                UpdateMeteric(listingDto, existingMetric);
            }

            await _listingMetrics.AddRangeAsync(newMetrics);
        }

        private void UpdateMeteric(ListingDTO listingDto, ListingMetric existingMetric)
        {
            existingMetric.Views = listingDto.ConvertedViews;
            existingMetric.Likes = listingDto.ConvertedLikes;
            existingMetric.LastUpdated = DateTime.Now;

            _listingMetrics.Update(existingMetric);
        }

        public ServiceResult<Listing> Delete(Guid id)
        {
            try{
                var listing = _listings.FindById(id);

                if (listing == null)
                {
                    return new ServiceResult<Listing>("Sales channel not found.");
                }

                _listings.Delete(listing);

                return new ServiceResult<Listing>(listing);

            }catch(Exception ex){
                return new ServiceResult<Listing>(ex.Message);
            }
        }

        public ServiceResult<Listing> FindListingsByItemNumber(string itemNumber)
        {
             var listing = _listings.FindByItemNumber(itemNumber);

            if(listing == null){
                return new ServiceResult<Listing>("Listing not found.");
            }

            return new ServiceResult<Listing>(listing);
        }

        public ServiceResult<Listing> FindListingsByTitle(string Title)
        {
            var listing = _listings.FindByTitle(Title);

            if(listing == null){
                return new ServiceResult<Listing>("Listing not found.");
            }

            return new ServiceResult<Listing>(listing);
        }

        public ServiceResult<IEnumerable<Listing>> GetAll()
        {
            return new ServiceResult<IEnumerable<Listing>>(_listings.GetAll());
        }

        public ServiceResult<IEnumerable<PriceMismatchDto>> MispricedListings()
        {
            return new ServiceResult<IEnumerable<PriceMismatchDto>>(_listings.MispricedListings(SalesChannelConstants.eBay));
        }

        public ServiceResult<Listing> GetById(Guid id)
        {
            var channel = _listings.FindById(id);

            if (channel == null)
            {
                return new ServiceResult<Listing>("Sales channel not found.");
            }

            return new ServiceResult<Listing>(channel);
        }

        public ServiceResult<Listing> Update(Listing item)
        {
            _listings.Update(item);

            return new ServiceResult<Listing>(item);
        }

        private void UpdateListing(Listing existing, ListingDTO listingDto)
        {
            if(CompareListing(existing, listingDto))
                return;
                
            existing.ItemTitle = listingDto.ItemTitle.Replace("  ", " ");
            existing.ItemNumber = listingDto.ItemNumber;
            //TOOO: Ebay Descriptions are coming from a sperate endpoint because of how they have to be retrieved.
            //Commenting this out for now to prevent overwriting them
            //existing.Description = (listingDto.Description 
            existing.Active = listingDto.Active;
            existing.Price = listingDto.ConvertedPrice;

            if(listingDto.EndedDate != null)
                existing.DateEnded = listingDto.EndedDate;
            if(listingDto.SoldDate != null)
                existing.DateSold = listingDto.SoldDate;
            if(listingDto.ListedDate != null)
                existing.DateListed = listingDto.ListedDate;

            existing.LastUpdated = DateTime.Now;

            Update(existing);
        }

        /// <summary>
        /// Compare listing and listingDto to see if they are the same
        /// </summary>
        /// <param name="existing">Listing Object from the database</param>
        /// <param name="listingDto">DTO from UI</param>
        /// <returns>True if objects are the same</returns>
        private bool CompareListing(Listing existing, ListingDTO listingDto)
        {
            return existing.ItemTitle == listingDto.ItemTitle &&
                existing.ItemNumber == listingDto.ItemNumber &&
                existing.Active == listingDto.Active &&
                existing.Price == listingDto.ConvertedPrice &&
                existing.DateEnded == listingDto.EndedDate &&
                existing.DateSold == listingDto.SoldDate &&
                existing.DateListed == listingDto.ListedDate;
        }

        /// <summary>
        /// Retrieves all listings that match the specified filter criteria.
        /// </summary>
        /// <param name="filter">The filter criteria to apply.</param>
        /// <returns>A collection of listings that match the filter criteria.</returns>
        public async Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter)
        {
            var listings = await _listings.GetAllListingsAsync(filter);

            return listings;
        }

        /// <summary>
        /// Retrieves the cross posted listing that matches the specified item number.
        /// </summary>
        /// <param name="itemNumber">The item number to find its corresponding listing for.</param>
        /// <returns>The matching listing to the one searched</returns>
        public ServiceResult<Listing> GetCrossPostByItem(string itemNumber)
        {
            var listing = _listings.FindCrossPostListingByItemNumber(itemNumber);

            if(listing == null){
                return new ServiceResult<Listing>("Listing not found.");
            }

            return new ServiceResult<Listing>(listing);
        }
    
        public void MarkSold(string itemNumber, string soldDate)
        {
            var listing = _listings.FindByItemNumber(itemNumber);

            if (listing == null)
            {
                throw new Exception("Listing not found.");
            }

            DateTime parsedDate;

            if (!DateTime.TryParse(soldDate, out parsedDate))
            {
                parsedDate = DateTime.Now;
            }

            listing.DateSold = parsedDate;
            listing.Active = false;
            listing.LastUpdated = DateTime.Now;

            _listings.Update(listing);
        }

        public ServiceResult<List<ItemNumberResponse>> GetCrossPostSold()
        {
            var result = _listings.GetSoldListings();
            
            return new ServiceResult<List<ItemNumberResponse>>(result.Select(x => new ItemNumberResponse { ItemNumber = x.Key, SalesChannel = x.Value }).ToList());
        }
        
        public ServiceResult<string> UpdateDescription(string itemNumber, string description)
        {
            var listing = _listings.FindByItemNumber(itemNumber);

            if (listing == null)
            {
                return new ServiceResult<string>("Listing not found.");
            }

            listing.Description = description;
            listing.LastUpdated = DateTime.Now;

            _listings.Update(listing);

            return new ServiceResult<string>(data:"Saved successfully.");
        }

        public List<CrossListingResult> GetListingsToCrossPost()
        {
            return _listings.ItemsToCrossList(Guid.Parse("28e91dfe-9a9d-482d-4aed-08db50d0bd42")).Take(20).ToList();
        }
    }
}
