using ListFlow.Domain.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;

namespace ListFlow.Infrastructure.Repository.Interface;

public interface IListingRepository : ICRUDRepo<Listing>, IRespository<Listing>
{
    Listing? FindByTitle(string ListingTitle);
    Listing? FindByItemNumberAsync(string itemNumber);
    List<Listing>? FindCrossPostListingByItemNumberAsync(string itemNumber);
    Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter);
    Dictionary<string, string> GetSoldListings();
    IEnumerable<CrossListingResult> ItemsToCrossList(Guid anchorSalesChannel);
    IEnumerable<CrossListingResult> ItemsNotUpdated(Guid salesChannel);
}