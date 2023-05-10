using ListFlow.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using ListFlow.Business.DTO;
using ListFlow.Domain.Model;

namespace ListFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
	public class InventoryController : ControllerBase
	{
		readonly IBasicService<Inventory> _inventoryService;
		public InventoryController(
			IBasicService<Inventory> inventoryService
		)
		{
			_inventoryService = inventoryService;
		}
		
        [HttpGet("{id}")]
        public ActionResult<Listing> GetById(Guid id)
        {
            var listing = _inventoryService.GetById(id);

            if (listing == null)
            {
                return NotFound();
            }

            return Ok(listing);
        }


		[HttpPost]
		public async Task<ActionResult> CreateInventory(InventoryDTO item)
		{
			if (item == null)
            {
                return BadRequest();
            }

            var inventory = new Inventory
            {
                Id = Guid.NewGuid(),
                Name = item.Name,
                Quantity = item.Quantity,
                Cost = item.Cost,
                Weight = item.Weight
            };

			var result = await _inventoryService.Create(inventory);
			
			if (!result.Success)
			{
				return BadRequest(result.ErrorMessage);
			}
			
			return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
		}
	}
}

