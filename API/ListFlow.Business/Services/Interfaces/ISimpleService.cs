namespace ListFlow.Business.Services.Interfaces;

public interface ISimpleService<T> where T : class
{
    Task Create(T obj);

    Task Delete(Guid id);

    Task<IEnumerable<T>> GetAll();

    Task<T> GetById(Guid id);

    Task<T> Update(T obj);
}