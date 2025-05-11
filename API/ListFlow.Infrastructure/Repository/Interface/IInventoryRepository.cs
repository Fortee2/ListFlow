using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository.Interface;

public interface IInventoryRepository : ICRUDRepo<Inventory>, IRespository<Inventory>
{
    Inventory? FindBySku(string sku);
}