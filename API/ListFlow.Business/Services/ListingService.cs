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

        public ServiceResult<Listing> Create(ListingDTO listing)
        {
            // Check if a channel with the same name already exists
            if (_listings.FindByTitle(listing.ItemTitle.ToLower()) != null)
            {
                return new ServiceResult<Listing>("A listing with this title already exists.");
            }

            var salesChannel = _salesChannels.FindByName(listing.SalesChannel);

            if (salesChannel == null)
            {
                return new ServiceResult<Listing>("The Sales Channel associated with this listing does not exist.");
            }

            var newListing = new Listing
            {
                ItemTitle = listing.ItemTitle,
                ItemNumber = listing.ItemNumber,
                Description = listing.Description,
                SalesChannelId = salesChannel.Id
            };

            _listings.Add(newListing);

            return new ServiceResult<Listing>(newListing);
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

        public ServiceResult<Listing> Update(Listing channel)
        {
            throw new NotImplementedException();
        }
    }
}
