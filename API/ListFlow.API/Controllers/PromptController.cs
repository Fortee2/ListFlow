using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using ListFlow.OpenAI.Dto;
using System.Text.Json.Nodes;
using ListFlow.OpenAI;
using ListFlow.OpenAI.Interfaces;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ListFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromptController : Controller
    {
        private IPromptService _promptService;

        public PromptController(IPromptService promptService)
        {
            _promptService = promptService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DescriptionPrompt promptData)
        {
            try
            {
                ChatCompletion completion = await _promptService.Submit(promptData.ToString());

                return new JsonResult(completion.choices.Count > 0 ? completion.choices[0].message : "");

               // return Ok(completion.choices.Count > 0 ? completion.choices[0].message : "");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
    
}

