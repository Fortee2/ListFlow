using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository;

public class PostageRepository: BaseRepository<Postage>
{
    public PostageRepository(ApplicationDbContext context) : base(context)
    {
    }
    
    
}