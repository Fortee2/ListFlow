using System.Collections.Generic;
using ListFlow.Domain.Model;
using System.Linq;
using ListFlow.Business.SalesChannels;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Business.Services
{

    public class UserService : IUserService
    {
        private readonly IUserRepository _Users;

        public UserService(IUserRepository UserService){
            _Users = UserService;
        }

        public ServiceResult<User> Create(string FirstName, string LastName, string Email, string Password)
        {
            // Check if a channel with the same name already exists
            if (_Users.FindByUserName(Email.ToLower()) == null)
            {
                return new ServiceResult<User>("A user with this name already exists.");
            }

            var newUser = new User
            {
               Email  = Email,
               FirstName = FirstName,
               LastName = LastName,
               HashedPassword = Password
            };

            _Users.Add(newUser);

            return new ServiceResult<User>(newUser);
        }

        public ServiceResult<User> Delete(Guid id)
        {
             var channel = _Users.FindById(id);

            if (channel == null)
            {
                return new ServiceResult<User>("User not found.");
            }

            

            return new ServiceResult<User>(channel);
        }

        public ServiceResult<IEnumerable<User>> GetAll()
        {
            return new ServiceResult<IEnumerable<User>>(_Users.GetAll());
        }

        public ServiceResult<User> GetById(Guid id)
        {
            var channel = _Users.FindById(id);

            if (channel == null)
            {
                return new ServiceResult<User>("User not found.");
            }

            return new ServiceResult<User>(channel);
        }

        public ServiceResult<User> Update(User channel)
        {
            throw new NotImplementedException();
        }
    }
}
