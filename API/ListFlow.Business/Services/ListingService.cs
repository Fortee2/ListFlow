using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;

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
                Id = new Guid(),
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

        public async Task<ServiceResult<Listing[]>> CreateListings(ListingDTO[] listingDtos)
        {
            List<Listing> newListings = new List<Listing>();

            if (listingDtos == null || listingDtos.Count() == 0)
            {
                return new ServiceResult<Listing[]>("No listings were provided.");
            }

            var salesChannel = _salesChannels.FindByName(listingDtos.First().SalesChannel);

            if (salesChannel == null)
            {
                return new ServiceResult<Listing[]>("The Sales Channel associated with these listings does not exist.");
            }

            foreach (var listingDto in listingDtos)
            {
                var existing = _listings.FindByItemNumber(listingDto.ItemNumber);

                if (existing == null)
                {
                    newListings.Add(new Listing{
                        Id = Guid.NewGuid(),
                        ItemTitle = listingDto.ItemTitle.Replace("  ", " "),
                        ItemNumber = listingDto.ItemNumber,
                        Description = listingDto.Description,
                        SalesChannel = salesChannel,
                        Active = listingDto.Active,
                        DateListed = listingDto.ListedDate,
                        DateEnded = listingDto.EndedDate,
                        DateSold = listingDto.SoldDate,
                        LastUpdated = DateTime.Now
                    });
                    continue;
                }
                
                UpdateListing(existing, listingDto);                
            }

            await _listings.AddRangeAsync(newListings);

            return new ServiceResult<Listing[]>(newListings.ToArray());
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
             var channel = _listings.FindById(id);

            if (channel == null)
            {
                return new ServiceResult<Listing>("Sales channel not found.");
            }

            return new ServiceResult<Listing>(channel);
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
            existing.Description = listingDto.Description;
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
                existing.Description == listingDto.Description &&
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

        public ServiceResult<Listing> GetByCrossPostId(string itemNumber)
        {
            var listing = _listings.FindCrossPostListingByItemNumber(itemNumber);

            if(listing == null){
                return new ServiceResult<Listing>("Listing not found.");
            }

            return new ServiceResult<Listing>(listing);
        }
    }
}
