using ListFlow.Business;
using ListFlow.Business.DTO;
using ListFlow.Domain.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;

namespace  ListFlow.Business.Services.Interfaces{
    public interface IListingService
    {
        Task<ServiceResult<Listing>> Create(ListingDTO listing);

        ServiceResult<Listing[]> CreateListings(ListingDTO[] listings);
        
        ServiceResult<Listing> Delete(Guid id);

        ServiceResult<IEnumerable<Listing>> GetAll();

        ServiceResult<Listing> GetById(Guid id);

        ServiceResult<Listing> GetCrossPostByItem(string itemNumber);

        ServiceResult<Listing> Update(Listing item);

        ServiceResult<Listing> FindListingsByTitle(string Title);

        ServiceResult<Listing> FindListingsByItemNumber(string itemNumber);

        ServiceResult<IEnumerable<PriceMismatchDto>> MispricedListings();

        Task CreateMetrics(ListingDTO[] listingDtos);

        Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter);
    }
}