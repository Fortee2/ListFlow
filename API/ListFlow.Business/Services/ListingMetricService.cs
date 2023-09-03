using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository;

namespace ListFlow.Business.Services{

    public class ListingMetricService:  IListingMetricService{

        IListingMetricRepository _listingMetricRepository;

        public ListingMetricService(IListingMetricRepository listingMetricRepository) 
        {
            _listingMetricRepository = listingMetricRepository;
        }

        public async Task<ServiceResult<ListingMetric>> Create(ListingMetric obj)
        {
            await _listingMetricRepository.AddAsync(obj);
            return new ServiceResult<ListingMetric>(obj);
        }

        public ServiceResult<ListingMetric> Delete(Guid id)
        {
             _listingMetricRepository.Delete(id);
            return new ServiceResult<ListingMetric>();
        }

        public ServiceResult<IEnumerable<ListingMetric>> GetAll()
        {
            throw new NotImplementedException();
        }

        public ServiceResult<ListingMetric> GetById(Guid id)
        {
            throw new NotImplementedException();
        }

        public ServiceResult<ListingMetric> GetByItemNumber(string ItemNumber)
        {
            var metric = _listingMetricRepository.FindByItemNumber(ItemNumber);

            if(metric == null)
            {
                return new ServiceResult<ListingMetric>("Metric not Found");
            }

            return new ServiceResult<ListingMetric>(metric);
        }

        public ServiceResult<ListingMetric> Update(ListingMetric obj)
        {
            _listingMetricRepository.Update(obj);
            return new ServiceResult<ListingMetric>(obj);
        }
    }
}