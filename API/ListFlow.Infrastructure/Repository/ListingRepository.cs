using ListFlow.Domain.Model;
using ListFlow.Domain.DTO;
using ListFlow.Infrastructure.Repository.Interface;
using ListFlow.Infrastructure.Filters;
using Microsoft.EntityFrameworkCore;
using System.Xml.Schema;

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

        /// <summary>
        /// Finds the crossposted listing associated with the item number passed in.
        /// </summary>
        /// <param name="ItemNumber">The item number to find its corresponding listing for.</param>
        /// <returns>The matching listing to the one searched</returns>
        public Listing? FindCrossPostListingByItemNumber(string ItemNumber)
        {
             var listing = FindByItemNumber(ItemNumber);

            if (listing != null)                
            {
                listing = (from list in this._dbContext.Listings.Include(l => l.SalesChannel)
                           where list.ItemNumber.ToLower() != ItemNumber.ToLower()
                                && list.CrossPostId == listing.CrossPostId
                                && list.CrossPostId != null
                           select list).FirstOrDefault();
            }

            return listing;
        }

        public IEnumerable<Listing> GetAll()
        {
            var listing = (from list in this._dbContext.Listings
                           where list.Active
                           orderby list.DateListed descending
                           select list).AsEnumerable();

            return listing;
        }

        /// <summary>
        /// Returns a list of listings that are mispriced.  The anchor sales channel is the sales channel that has the correct price.
        /// </summary>
        /// <param name="anchorSalesChannel">The GUID for the Sales Channel that has the correct price</param>
        /// <returns>JSON Object of misprices items</returns>
        public IEnumerable<PriceMismatchDto> MispricedListings(Guid anchorSalesChannel)
        {
            var listing = (from list in this._dbContext.Listings
                             join  scList in this._dbContext.Listings on list.CrossPostId equals scList.CrossPostId
                           where list.Active
                            && scList.Active
                            && list.Price > scList.Price
                            && scList.SalesChannel.Id == anchorSalesChannel
                            && list.SalesChannel.Id != scList.SalesChannel.Id
                           orderby list.Price descending
                           select new PriceMismatchDto(
                                list.ItemNumber,
                                list.ItemTitle,
                                list.Price,
                                scList.Price,
                                scList.ItemNumber,
                                list.SalesChannel.Id.ToString(),
                                scList.SalesChannel.Id.ToString()
                           )).AsEnumerable();

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

        public Dictionary<string, string> GetSoldListings()
        {
            var listing = (from list in this._dbContext.Listings
                join  scList in this._dbContext.Listings on list.CrossPostId equals scList.CrossPostId
                where list.DateSold != null
                      && scList.Active 
                      && list.SalesChannel.Id != scList.SalesChannel.Id
                orderby list.Price descending
                select new
                {
                    scList.SalesChannel.Name,
                    scList.ItemNumber
                }).ToDictionary(x => x.ItemNumber, x => x.Name);

            return listing;
        }
    }
}

