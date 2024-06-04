using ListFlow.Business.DTO;
using ListFlow.Domain.Model;

namespace ListFlow.Business.Services.Interfaces;

public interface IImageService
{
    IEnumerable<Images>? FindByItemNumber(string itemNumber);
    Task Create(ImageDto obj);
}