using ListFlow.Business;
using ListFlow.Business.DTO;
using ListFlow.Domain.Model;

public interface IListingService
{
    ServiceResult<Listing> Create(ListingDTO listing);

    ServiceResult<Listing> Delete(Guid id);

    ServiceResult<IEnumerable<Listing>> GetAll();

    ServiceResult<Listing> GetById(Guid id);

    ServiceResult<Listing> Update(Listing Listing);

    ServiceResult<Listing> FindListingsByTitle(string Title);
}