using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Business.Services;

public class InventoryService(IInventoryRepository inventoryRepository)
    : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepository =
        inventoryRepository ?? throw new ArgumentNullException(nameof(inventoryRepository));

    public async Task<ServiceResult<Inventory>> Create(Inventory obj)
    {
        if (obj == null) throw new ArgumentNullException(nameof(obj), "Inventory cannot be null");

        if (string.IsNullOrWhiteSpace(obj.Name)) throw new ArgumentException("Name cannot be null or empty", obj.Name);

        var item = new Inventory
        {
            Name = obj.Name,
            Quantity = obj.Quantity,
            Cost = obj.Cost,
            Weight = obj.Weight,
            Sku = obj.Sku ?? Guid.NewGuid().ToString()
        };


        var lookUp = _inventoryRepository.FindBySku(item.Sku);

        if (lookUp == null)
        {
            await _inventoryRepository.AddAsync(item);
        }
        else
        {
            if (!HasInventoryChanged(lookUp, item)) return new ServiceResult<Inventory>(lookUp);

            lookUp.Name = item.Name;
            lookUp.Quantity = item.Quantity;
            lookUp.Cost = item.Cost;
            lookUp.Weight = item.Weight;

            _inventoryRepository.Update(lookUp);
        }

        return new ServiceResult<Inventory>(lookUp ?? item);
    }

    public void Delete(Guid id)
    {
        var inventory = GetInventoryById(id);

        if (inventory != null)
            _inventoryRepository.Delete(inventory);
        else
            throw new ArgumentException($"Inventory with ID '{id}' does not exist", nameof(id));
    }

    public ServiceResult<IEnumerable<Inventory>> GetAll()
    {
        try
        {
            var inventories = _inventoryRepository.GetAll();
            return new ServiceResult<IEnumerable<Inventory>>(inventories);
        }
        catch (InvalidOperationException e)
        {
            return new ServiceResult<IEnumerable<Inventory>>(e.Message);
        }
    }

    public ServiceResult<Inventory> GetById(Guid id)
    {
        var inventory = GetInventoryById(id);

        if (inventory != null) return new ServiceResult<Inventory>(inventory);

        throw new ArgumentException($"Inventory with ID '{id}' does not exist", nameof(id));
    }

    public ServiceResult<Inventory> Update(Inventory obj)
    {
        if (obj == null) throw new ArgumentNullException(nameof(obj), "Inventory cannot be null");

        var inventory = GetInventoryById(obj.Id);

        if (inventory != null)
        {
            if (!string.IsNullOrWhiteSpace(obj.Name) && inventory.Name != obj.Name) inventory.Name = obj.Name;

            if (inventory.Quantity != obj.Quantity) inventory.Quantity = obj.Quantity;

            if (inventory.Cost != obj.Cost) inventory.Cost = obj.Cost;

            if (inventory.Weight != obj.Weight) inventory.Weight = obj.Weight;

            if (HasInventoryChanged(inventory, obj))
                try
                {
                    _inventoryRepository.Update(inventory);
                    return new ServiceResult<Inventory>(inventory);
                }
                catch (InvalidOperationException e)
                {
                    return new ServiceResult<Inventory>(e.Message);
                }

            return new ServiceResult<Inventory>(inventory);
        }

        throw new ArgumentException($"Inventory with ID '{obj.Id}' does not exist", nameof(obj));
    }

    public Inventory? FindBySku(string sku)
    {
        return _inventoryRepository.FindBySku(sku);
    }

    private Inventory? GetInventoryById(Guid id)
    {
        return _inventoryRepository.FindById(id);
    }

    private bool HasInventoryChanged(Inventory oldInventory, Inventory newInventory)
    {
        return oldInventory.Name != newInventory.Name
               || oldInventory.Quantity != newInventory.Quantity
               || oldInventory.Cost != newInventory.Cost
               || oldInventory.Weight != newInventory.Weight;
    }
}