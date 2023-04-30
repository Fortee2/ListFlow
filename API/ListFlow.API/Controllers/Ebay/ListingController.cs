using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.OpenAI.Dto;
using Microsoft.AspNetCore.Mvc;

namespace ListFlow.API.Controllers.EBay{

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
        public ActionResult<IEnumerable<Listing>> Get()
        {
            var listing = _listingService.GetAll();
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
        public IActionResult Create(ListingDTO listing)
        {
            var result = _listingService.Create(listing);

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