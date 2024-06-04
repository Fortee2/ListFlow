using ListFlow.Business.DTO;
using ListFlow.Business.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ListFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController: ControllerBase
{
    private readonly IImageService _imageService;
    
    public ImagesController(IImageService imageService)
    {
        _imageService = imageService;
    }
    
    [HttpPost]
    public async Task<ActionResult> AddImage([FromBody] ImageDto imageDto)
    {
        await _imageService.Create(imageDto);
        return Ok();
    }
}