using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository
{
    public partial class LoginActivityRepository : BaseRepository<LoginActivity>
    {
        public LoginActivityRepository(ApplicationDbContext context) : base(context)
        {
        }
    }

}

