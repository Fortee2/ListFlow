using ListFlow.Domain.Model;
namespace ListFlow.Infrastructure.Repository
{
    public partial class InventoryRepository : BaseRepository<Inventory>
    {
        public InventoryRepository(ApplicationDbContext context) : base(context)
        {
        }
    }

}

