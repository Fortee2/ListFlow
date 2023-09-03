using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;
using System.Linq;

namespace ListFlow.Infrastructure.Repository
{
    public partial class ListingMetricRepository : BaseRepository<ListingMetric>, IListingMetricRepository
    {
        public ListingMetricRepository(ApplicationDbContext context) : base(context)
        {
        }

        public ListingMetric? FindByItemNumber(string ItemNumber)
        {
            var listingMetric = (from metric in this._dbContext.ListingMetrics
                                     join listing in this._dbContext.Listings on metric.ListingId equals listing.Id
                                 where listing.ItemNumber.Contains(ItemNumber)
                                 select metric).FirstOrDefault();

            return listingMetric;
        }

        public IEnumerable<ListingMetric> GetAll()
        {
            throw new NotImplementedException();
        }

        ListingMetric? IRespository<ListingMetric>.FindById(Guid Id)
        {
            throw new NotImplementedException();
        }
    }
}