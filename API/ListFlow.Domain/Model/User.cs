using System;
namespace ListFlow.Domain.Model
{

    public class User
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string HashedPassword { get; set; }
        public Guid MasterAccountId { get; set; }
    }
}

