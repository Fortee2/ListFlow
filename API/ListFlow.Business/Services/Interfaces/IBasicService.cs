namespace ListFlow.Business.Services.Interfaces;

public interface IBasicService<T>
{
    Task<ServiceResult<T>> Create(T obj);

    void Delete(Guid id);

    ServiceResult<IEnumerable<T>> GetAll();

    ServiceResult<T> GetById(Guid id);

    ServiceResult<T> Update(T obj);
}