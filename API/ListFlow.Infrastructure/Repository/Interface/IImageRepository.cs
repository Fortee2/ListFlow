using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository.Interface;

public interface IImageRepository: ICRUDRepo<Images>, IRespository<Images>
{
    IEnumerable<Images>? FindByItemNumber(string itemNumber);
}