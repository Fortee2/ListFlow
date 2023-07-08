using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

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
                           where list.ItemNumber.Contains(ItemNumber)
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

        public IEnumerable<Listing> GetAll()
        {
            var listing = (from list in this._dbContext.Listings
                           select list).AsEnumerable();

            return listing;
        }
    }
}

