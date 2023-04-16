using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository
{
    public partial class UserRepository : BaseRepository<User>
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }
    }

}

