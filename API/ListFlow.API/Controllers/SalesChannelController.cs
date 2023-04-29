using System.Collections.Generic;
using ListFlow.Domain.Model;
using ListFlow.Business.SalesChannels;
using ListFlow.Infrastructure.Repository;
using Microsoft.AspNetCore.Mvc;

namespace ListFlow.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesChannelsApiController : ControllerBase
    {
        private readonly ISalesChannelService _salesChannelService;

        public SalesChannelsApiController(ISalesChannelService salesChannelService)
        {
            _salesChannelService = salesChannelService;
        }

        [HttpGet]
        public ActionResult<IEnumerable<SalesChannel>> Get()
        {
            var salesChannels = _salesChannelService.GetAll();
            return Ok(salesChannels);
        }

        [HttpGet("{id}")]
        public ActionResult<SalesChannel> GetById(Guid id)
        {
            var salesChannel = _salesChannelService.GetById(id);

            if (salesChannel == null)
            {
                return NotFound();
            }

            return Ok(salesChannel);
        }

        [HttpPost]
        public IActionResult Create(string salesChannel)
        {
            var result = _salesChannelService.Create(salesChannel);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public IActionResult Update(SalesChannel updatedSalesChannel)
        {
            var result = _salesChannelService.Update(updatedSalesChannel);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var result = _salesChannelService.Delete(id);

            if (!result.Success)
            {
                return NotFound(result.ErrorMessage);
            }

            return NoContent();
        }
    }
}
