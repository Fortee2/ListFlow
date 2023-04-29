using System;
using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository.Interface
{
    public interface IUserRepository: ICRUDRepo<User>, IRespository<User>{
        User? FindByUserName(string userName);
    }
}