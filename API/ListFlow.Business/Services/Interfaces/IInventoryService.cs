using ListFlow.Domain.Model;

namespace ListFlow.Business.Services.Interfaces;

public interface IInventoryService : IBasicService<Inventory>
{
    Inventory? FindBySku(string sku);
}