using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository
{
    public partial class SalesChannelRepository : BaseRepository<SalesChannel>
    {
        public SalesChannelRepository(ApplicationDbContext context) : base(context)
        {
        }
    }

}

