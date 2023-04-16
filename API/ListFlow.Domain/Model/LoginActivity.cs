using System;
namespace ListFlow.Domain.Model
{
    public class LoginActivity
    {
        public Guid Id { get; set; }
        public DateTime LastLoggedInDate { get; set; }
        public DateTime LastFailedDate { get; set; }
        public int NumberOfAttempts { get; set; }
        public Guid UserId { get; set; }
    }
}

