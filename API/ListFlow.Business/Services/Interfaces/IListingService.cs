using ListFlow.Business.DTO;
using ListFlow.Domain.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;

namespace ListFlow.Business.Services.Interfaces;

public interface IListingService
{
    Task<ServiceResult<Listing>> Create(ListingDTO listing);

    Task CreateListings(ListingDTO[] listings);

    ServiceResult<Listing> Delete(Guid id);

    ServiceResult<IEnumerable<Listing>> GetAll();

    ServiceResult<Listing> GetById(Guid id);

    ServiceResult<List<Listing>> GetCrossPostByItem(string itemNumber);

    Task<ServiceResult<Listing>> Update(Listing item);

    ServiceResult<Listing> FindListingsByTitle(string Title);

    ServiceResult<Listing> FindListingsByItemNumber(string itemNumber);

    Task CreateMetrics(ListingDTO[] listingDtos);

    Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter);

    Task MarkSold(string itemNumber, string? soldDate);
    ServiceResult<List<ItemNumberResponse>> GetCrossPostSold();
    Task<ServiceResult<string>> UpdateDescription(string itemNumber, string description);

    List<CrossListingResult> GetListingsToCrossPost(string salesChannelName);
    List<CrossListingResult> GetListingsToVerify(string salesChannelName);
    Task MarkInactive(string itemNumber);
}