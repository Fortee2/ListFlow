using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Infrastructure.Repository
{
    public interface IListingMetricRepository: ICRUDRepo<ListingMetric>,  IRespository<ListingMetric> 
    {
        ListingMetric?  FindByItemNumber(string ItemNumber);
    }
}