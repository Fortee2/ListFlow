using ListFlow.Business.DTO;
using ListFlow.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BulkListingController(ILogger<BulkListingController> logger, IListingService listingService)
    : Controller
{
    [HttpPost]
    public async Task<IActionResult> Create(ListingDTO[] listingDtos)
    {
        try
        {
            await listingService.CreateListings(listingDtos).ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex.Message, ex);
            return StatusCode(500, "An error occurred while creating listings");
        }
    }
}