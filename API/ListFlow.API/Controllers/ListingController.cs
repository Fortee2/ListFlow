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
        private readonly  IBasicService<Postage> _postageService;

        public ListingController(IListingService listingService,  IBasicService<Postage> postageService)
        {
            _listingService = listingService;
            _postageService = postageService;
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

            if (!listing.Success)
            {
                return NotFound(listing.ErrorMessage);
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

        [HttpGet("sold")]
        public ActionResult<Dictionary<string, string>> GetSoldListings()
        {
            var listing = _listingService.GetCrossPostSold();
            return Ok(listing);
        }
        
        [HttpPut("{itemNumber}/description")]
        public IActionResult UpdateDescription(string itemNumber, [FromBody] DescriptionDto description)
        {
            var result = _listingService.UpdateDescription(itemNumber, description.Description);

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return NoContent();
        }
        
        [HttpPost("{itemNumber}/postage")]
        public async Task<IActionResult> CreatePostage(string itemNumber, [FromBody] PostageDto postage)
        {
            var listing =  _listingService.FindListingsByItemNumber(itemNumber).Data;

            var result = await _postageService.Create(new Postage()
            {
                Id = listing.Id,
                Height = postage.PackageHeight,
                Width = postage.PackageWidth,
                Length = postage.PackageLength,
                Ounces = postage.MinorElement,
                Pounds = postage.MajorElement,
            });

            if (!result.Success)
            {
                return BadRequest(result.ErrorMessage);
            }

            return NoContent();
        }
        
        [HttpGet("toCrossPost")]
        public ActionResult<IEnumerable<Listing>> GetListingsToCrossPost()
        {
            var listing = _listingService.GetListingsToCrossPost();
            return Ok(listing);
        }
    }
