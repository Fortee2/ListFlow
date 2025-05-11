using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Infrastructure.Repository;

public class InventoryRepository : BaseRepository<Inventory>, IInventoryRepository
{
    public InventoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public IEnumerable<Inventory> GetAll()
    {
        throw new NotImplementedException();
    }

    public Inventory? FindBySku(string sku)
    {
        return _dbContext.Inventories.FirstOrDefault(i => i.Sku == sku);
    }
}