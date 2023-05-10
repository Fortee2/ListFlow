using System;
using ListFlow.Business.DTO;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Business.Services
{
    public class InventoryService : IBasicService<Inventory>
    {
        private readonly IInventoryRepository _inventoryRepository;

        public InventoryService(IInventoryRepository inventoryRepository)
        {
            _inventoryRepository = inventoryRepository ?? throw new ArgumentNullException(nameof(inventoryRepository));
        }

        public async Task<ServiceResult<Inventory>> Create(Inventory obj)
        {
            if (obj == null)
            {
                throw new ArgumentNullException(nameof(obj), "Inventory cannot be null");
            }

            if (string.IsNullOrWhiteSpace(obj.Name))
            {
                throw new ArgumentException("Name cannot be null or empty", nameof(obj.Name));
            }

            await _inventoryRepository.AddAsync(obj);
            return new ServiceResult<Inventory>(obj);
        }

        public ServiceResult<Inventory> Delete(Guid id)
        {
            var inventory = GetInventoryById(id);

            if (inventory != null)
            {
                try
                {
                    _inventoryRepository.Delete(inventory);
                    return new ServiceResult<Inventory>(inventory);
                }
                catch (InvalidOperationException e)
                {
                    return new ServiceResult<Inventory>(e.Message);
                }
            }
            else
            {
                throw new ArgumentException($"Inventory with ID '{id}' does not exist", nameof(id));
            }
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

            if (inventory != null)
            {
                return new ServiceResult<Inventory>(inventory);
            }
            else
            {
                throw new ArgumentException($"Inventory with ID '{id}' does not exist", nameof(id));
            }
        }

        public ServiceResult<Inventory> Update(Inventory obj)
        {
            if (obj == null)
            {
                throw new ArgumentNullException(nameof(obj), "Inventory cannot be null");
            }

            var inventory = GetInventoryById(obj.Id);

            if (inventory != null)
            {
                if (!string.IsNullOrWhiteSpace(obj.Name) && inventory.Name != obj.Name)
                {
                    inventory.Name = obj.Name;
                }

                if (inventory.Quantity != obj.Quantity)
                {
                    inventory.Quantity = obj.Quantity;
                }

                if (inventory.Cost != obj.Cost)
                {
                    inventory.Cost = obj.Cost;
                }

                if (inventory.Weight != obj.Weight)
                {
                    inventory.Weight = obj.Weight;
                }

                if (HasInventoryChanged(inventory, obj))
                {
                    try
                    {
                        _inventoryRepository.Update(inventory);
                        return new ServiceResult<Inventory>(inventory);
                    }
                    catch (InvalidOperationException e)
                    {
                        return new ServiceResult<Inventory>(e.Message);
                    }
                }
                else
                {
                    return new ServiceResult<Inventory>(inventory);
                }
            }
            else
            {
                throw new ArgumentException($"Inventory with ID '{obj.Id}' does not exist", nameof(obj));
            }
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
}
