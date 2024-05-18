using ListFlow.Business.DTO;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;
using Microsoft.AspNetCore.Mvc;

namespace ListFlow.API.Controllers;

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
     
        [HttpPut("{itemNumber}/sold")]
        public IActionResult MarkSold(string itemNumber, [FromBody] SoldDateDto soldDate )
        {
            _listingService.MarkSold(itemNumber, soldDate.SoldDate);
            return NoContent();
        }

        /// <summary>
        /// Gets the matching crossposted listing for the item number passed in.
        /// </summary>
        /// <param name="itemNumber">Item Number to search for </param>
        /// <returns>Listing Object or 404 if no listing found </returns>
        [HttpGet("{itemNumber}/crosspost")]
        public ActionResult<Listing> GetCrossPost(string itemNumber)
        {
            var listing = _listingService.GetCrossPostByItem(itemNumber);

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

        [HttpGet("mispriced")]
        public ActionResult<IEnumerable<PriceMismatchDto>> GetMispricedListingsAsync()
        {
            var listing =  _listingService.MispricedListings();
            return Ok(listing);
        }

    }
