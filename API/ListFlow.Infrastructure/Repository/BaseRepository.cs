using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Infrastructure.Repository;

public class BaseRepository<T> : ICRUDRepo<T> where T : class
{
    protected ApplicationDbContext _dbContext;

    public BaseRepository(ApplicationDbContext context)
    {
        _dbContext = context;
    }

    public virtual void Add(T obj)
    {
        _dbContext.Add(obj);
        _dbContext.SaveChanges();
    }

    public async Task<int> AddAsync(T obj)
    {
        await _dbContext.AddAsync(obj);
        return await _dbContext.SaveChangesAsync();
    }

    public void AddRange(List<T> values)
    {
        _dbContext.AddRange(values);
        _dbContext.SaveChanges();
    }

    public async Task<int> AddRangeAsync(List<T> values)
    {
        await _dbContext.AddRangeAsync(values);
        return await _dbContext.SaveChangesAsync();
    }

    public void Delete(T obj)
    {
        _dbContext.Remove(obj);
        _dbContext.SaveChanges();
    }

    public void Delete(Guid id)
    {
        var record = FindById(id);
        if (record != null)
        {
            _dbContext.Remove(record);
            _dbContext.SaveChanges();
        }
    }

    public void Update(T obj)
    {
        _dbContext.Update(obj);
        _dbContext.SaveChanges();
    }
    
    
    public Task UpdateAsync(T obj)
    {
        _dbContext.Update(obj);
        return _dbContext.SaveChangesAsync();
    }

    public async Task UpdateRangeAsync(List<T> values)
    {
        _dbContext.UpdateRange(values);
        await _dbContext.SaveChangesAsync();
    }

    public T? FindById(Guid id)
    {
        return _dbContext.Find<T>(id);
    }

    public ApplicationDbContext GetDbContext()
    {
        return _dbContext;
    }
}
