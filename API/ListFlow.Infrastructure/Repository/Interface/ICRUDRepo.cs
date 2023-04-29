using System;
namespace ListFlow.Infrastructure.Repository.Interface
{
    public interface ICRUDRepo<T> 
    {
        void Add(T obj);
        Task<int> AddAsync(T obj);
        void Update(T obj);
        void Delete(T obj);
        void Delete(Guid id);
        void AddRange(List<T> values);
        Task<int> AddRangeAsync(List<T> values);
    }
}

