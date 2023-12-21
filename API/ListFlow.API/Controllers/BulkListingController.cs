using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ListFlow.Business.DTO;
using ListFlow.Domain.Model;
using ListFlow.Business.Services.Interfaces;  
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ListFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BulkListingController : Controller
    {
        private readonly IListingService _listingService;
        private readonly ILogger<BulkListingController> _logger;   

        public BulkListingController(ILogger<BulkListingController> logger, IListingService listingService)
        {
            _logger = logger;
            _listingService = listingService;
        }

        [HttpPost]
        public async Task<IActionResult> Create(ListingDTO[] listingDtos) {
            try
            {
                _listingService.CreateListings(listingDtos);
                await _listingService.CreateMetrics(listingDtos);
            }catch(Exception ex)
            {
                _logger.LogError(ex.Message, ex);
            }
                         
            return Ok();
        }
    }
}

