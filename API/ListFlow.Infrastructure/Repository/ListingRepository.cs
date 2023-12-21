using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;
using ListFlow.Infrastructure.Filters;
using Microsoft.EntityFrameworkCore;

namespace ListFlow.Infrastructure.Repository
{
    public partial class ListingRepository : BaseRepository<Listing>, IListingRepository
    {
        public ListingRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Listing? FindByItemNumber(string ItemNumber)
        {
            var listing = (from list in this._dbContext.Listings
                           where list.ItemNumber.ToLower() == ItemNumber.ToLower()
                           select list).FirstOrDefault();

            return listing;
        }

        public Listing? FindByTitle(string ListingTitle)
        {
            var listing = (from list in this._dbContext.Listings
                           where list.ItemTitle.Contains(ListingTitle)
                           select list).FirstOrDefault();

            return listing;
        }

        public Listing? FindCrossPostListingByItemNumber(string ItemNumber)
        {
             var listing = FindByItemNumber(ItemNumber);

            if (listing != null)                
            {
                listing = (from list in this._dbContext.Listings
                           where list.ItemNumber.ToLower() != ItemNumber.ToLower()
                                && list.CrossPostId == listing.CrossPostId
                           select list).FirstOrDefault();
            }

            return listing;
        }

        public IEnumerable<Listing> GetAll()
        {
            var listing = (from list in this._dbContext.Listings
                           where list.Active == true
                           orderby list.DateListed descending
                           select list).AsEnumerable();

            return listing;
        }

        public async Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter)
        {
            var query = _dbContext.Listings.AsQueryable();

            if (filter != null)
            {
              
                if (!string.IsNullOrEmpty(filter.SalesChannel))
                {
                    query = query.Where(l => l.SalesChannel.Id.ToString() == filter.SalesChannel);
                }

                if (!string.IsNullOrEmpty(filter.ItemNumber))
                {
                    query = query.Where(l => l.ItemNumber == filter.ItemNumber);
                }

                if (!string.IsNullOrEmpty(filter.ItemTitle))
                {
                    query = query.Where(l => l.ItemTitle.Contains(filter.ItemTitle));
                }

                if (filter.DateRange != null)
                {
                    query = query.Where(l => l.DateListed >= filter.DateRange.StartDate && l.DateListed <= filter.DateRange.EndDate);
                }
            }

            var listings = await query.ToListAsync();

            return listings;
        }
    }
}

