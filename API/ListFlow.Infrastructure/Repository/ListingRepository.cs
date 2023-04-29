using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Infrastructure.Repository
{
    public partial class ListingRepository : BaseRepository<Listing>, IListingRepository
    {
        public ListingRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Listing? FindByTitle(string ListingTitle)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<Listing> GetAll()
        {
            throw new NotImplementedException();
        }
    }
}

