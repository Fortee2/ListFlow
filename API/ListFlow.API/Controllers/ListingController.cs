using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;
using ListFlow.OpenAI.Dto;
using Microsoft.AspNetCore.Mvc;

namespace ListFlow.API.Controllers{

    [ApiController]
    [Route("api/[controller]")]
    public class ListingController : ControllerBase
    {
        private readonly IListingService _listingService;

        public ListingController(IListingService listingService)
        {
            _listingService = listingService;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Listing>>> GetAllListingsAsync([FromQuery]ListingFilter filter)
        {
            var listing = await _listingService.GetAllListingsAsync(filter);
            return Ok(listing);
        }
     
        [HttpGet("{itemNumber}/crosspostid")]
        public ActionResult<Listing> GetByCrossPostId(string itemNumber)
        {
            var listing = _listingService.GetByCrossPostId(itemNumber);

            if (listing == null)
            {
                return NotFound();
            }

            return Ok(listing);
        }

        [HttpGet("{id}")]
        public ActionResult<Listing> GetById(Guid id)
        {
            var listing = _listingService.GetById(id);

            if (listing == null)
            {
                return NotFound();
            }

            return Ok(listing);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ListingDTO listing)
        {
            var result = await _listingService.Create(listing);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public IActionResult Update(Listing updatedlisting)
        {
            var result = _listingService.Update(updatedlisting);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var result = _listingService.Delete(id);

            if (!result.Success)
            {
                return NotFound(result.ErrorMessage);
            }

            return NoContent();
        }
    }

    
}