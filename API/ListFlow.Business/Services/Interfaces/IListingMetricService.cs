using ListFlow.Domain.Model;

namespace  ListFlow.Business.Services.Interfaces{
    public interface IListingMetricService: IBasicService<ListingMetric>{
        ServiceResult<ListingMetric> GetByItemNumber(string ItemNumber);
    }
}