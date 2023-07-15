using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Business.Services
{

    public class ListingService : IListingService
    {
        private readonly IListingRepository _listings;
        private readonly ISalesChannelRepository _salesChannels;

        public ListingService(IListingRepository listingRepository, ISalesChannelRepository salesChannelRepository){
            _listings = listingRepository;
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
                Active = listing.Active
            };

            await _listings.AddAsync(newListing);

            return new ServiceResult<Listing>(newListing);
        }

        public async Task<ServiceResult<Listing[]>> CreateListings(ListingDTO[] listingDtos)
        {
            List<ListingDTO> newListings = new List<ListingDTO>();

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
                    newListings.Add(listingDto);
                    continue;
                }

                UpdateListing(existing, listingDto);
            }

            var listings = newListings.Select(dto => new Listing {
                Id = Guid.NewGuid(),
                ItemTitle = dto.ItemTitle,
                ItemNumber = dto.ItemNumber,
                Description = dto.Description,
                SalesChannel = salesChannel,
                Active = dto.Active
            });

            await _listings.AddRangeAsync(listings.ToList());

            return new ServiceResult<Listing[]>(listings.ToArray());
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
            existing.ItemTitle = listingDto.ItemTitle;
            existing.ItemNumber = listingDto.ItemNumber;
            existing.Description = listingDto.Description;
            existing.Active = listingDto.Active;

            Update(existing);
        }
    }
}
