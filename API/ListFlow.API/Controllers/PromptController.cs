using ListFlow.OpenAI.Dto;
using ListFlow.OpenAI.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ListFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromptController : Controller
{
    private readonly IPromptService _promptService;

    public PromptController(IPromptService promptService)
    {
        _promptService = promptService;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] DescriptionPrompt promptData)
    {
        try
        {
            var completion = await _promptService.Submit(promptData.ToString());

            return new JsonResult(completion.choices.Count > 0 ? completion.choices[0].message : "");

            // return Ok(completion.choices.Count > 0 ? completion.choices[0].message : "");
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}