using System;
namespace ListFlow.Infrastructure.Repository
{
    public partial class ListingRepository : BaseRepository<Listing>
    {
        public ListingRepository(ApplicationDbContext context) : base(context)
        {
        }
    }

}

