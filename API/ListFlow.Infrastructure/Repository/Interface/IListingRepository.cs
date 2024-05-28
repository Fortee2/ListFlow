using System;
using ListFlow.Domain.Model;
using ListFlow.Domain.DTO;
using ListFlow.Infrastructure.Filters;

namespace ListFlow.Infrastructure.Repository.Interface
{
    public interface IListingRepository: ICRUDRepo<Listing>, IRespository<Listing>{
        Listing? FindByTitle(string ListingTitle);

        Listing? FindByItemNumber(string ItemNumber);

        Listing? FindCrossPostListingByItemNumber(string ItemNumber);
        Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter);

        IEnumerable<PriceMismatchDto> MispricedListings(Guid anchorSalesChannel);
        Dictionary<string, string> GetSoldListings();
    }
}