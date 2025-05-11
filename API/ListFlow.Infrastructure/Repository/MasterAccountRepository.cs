using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository;

public class MasterAccountRepository : BaseRepository<MasterAccount>
{
    public MasterAccountRepository(ApplicationDbContext context) : base(context)
    {
    }
}