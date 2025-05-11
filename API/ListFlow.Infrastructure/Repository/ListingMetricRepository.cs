using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Infrastructure.Repository;

public class ListingMetricRepository : BaseRepository<ListingMetric>, IListingMetricRepository
{
    public ListingMetricRepository(ApplicationDbContext context) : base(context)
    {
    }

    public ListingMetric? FindByItemNumber(string ItemNumber)
    {
        var listingMetric = (from metric in _dbContext.ListingMetrics
            join listing in _dbContext.Listings on metric.ListingId equals listing.Id
            where listing.ItemNumber.ToLower() == ItemNumber.ToLower()
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