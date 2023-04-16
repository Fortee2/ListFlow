using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ListFlow.OpenAI.Dto;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ListFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EbayController : Controller
    {
        // GET: /<controller>/
        [HttpGet]
        public IActionResult Get()
        {
            ExtentstionDto extentsionDto = new ExtentstionDto();

            extentsionDto.type = "openURL";
            extentsionDto.content = "Hello!";
            extentsionDto.textareaId = "se-rte-editor__rich";
            extentsionDto.url = "https://www.ebay.com/sl/list?mode=ReviseItem&itemId=185855824948";

            return Ok(extentsionDto);
        }
    }
}

