using ListFlow.Business;
using ListFlow.Domain.Model;

public interface IUserService
    {
        ServiceResult<User> Create(string FirstName, string LastName, string Email, string Password);

        ServiceResult<User> Delete(Guid id);

        ServiceResult<IEnumerable<User>> GetAll();

        ServiceResult<User> GetById(Guid id);

        ServiceResult<User> Update(User user);
    }