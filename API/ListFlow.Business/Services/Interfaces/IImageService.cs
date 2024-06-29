using ListFlow.Business.DTO;
using ListFlow.Domain.Model;

namespace ListFlow.Business.Services.Interfaces;

public interface IImageService:ISimpleService<Images>
{
    IEnumerable<Images>? FindByItemNumber(string itemNumber);
}