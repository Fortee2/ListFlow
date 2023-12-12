using ListFlow.Business;
using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;

public interface IListingService
{
    Task<ServiceResult<Listing>> Create(ListingDTO listing);
    Task<ServiceResult<Listing[]>> CreateListings(ListingDTO[] listings);
    ServiceResult<Listing> Delete(Guid id);

    ServiceResult<IEnumerable<Listing>> GetAll();

    ServiceResult<Listing> GetById(Guid id);

    ServiceResult<Listing> GetByCrossPostId(string itemNumber);

    ServiceResult<Listing> Update(Listing Listing);

    ServiceResult<Listing> FindListingsByTitle(string Title);

    ServiceResult<Listing> FindListingsByItemNumber(string Title);

    Task CreateMetrics(ListingDTO[] listingDtos);

    Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter);
}