using System;
using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository
{
    public partial class MasterAccountRepository : BaseRepository<MasterAccount>
    {
        public MasterAccountRepository(ApplicationDbContext context) : base(context)
        {
        }
    }

}

