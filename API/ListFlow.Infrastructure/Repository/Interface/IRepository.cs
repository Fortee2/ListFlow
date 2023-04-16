using System;
namespace ListFlow.Infrastructure.Repository.Interface
{
    public interface IRespository<T>
    {
        ApplicationDbContext GetDbContext();

        T? FindById(int Id);
    }
}

