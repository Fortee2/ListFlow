using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository;

namespace ListFlow.Business.Services;

public class PostageService: IBasicService<Postage>
{
    private readonly BaseRepository<Postage> _postageRepository;

    public PostageService(BaseRepository<Postage> postageRepository)
    {
        _postageRepository = postageRepository;
    }
    public async Task<ServiceResult<Postage>> Create(Postage obj)
    {
        await _postageRepository.AddAsync(obj);
        return new ServiceResult<Postage>(obj);
    }

    public ServiceResult<Postage> Delete(Guid id)
    {
        throw new NotImplementedException();
    }

    public ServiceResult<IEnumerable<Postage>> GetAll()
    {
        throw new NotImplementedException();
    }

    public ServiceResult<Postage> GetById(Guid id)
    {
        throw new NotImplementedException();
    }

    public ServiceResult<Postage> Update(Postage obj)
    {
        _postageRepository.Update(obj);
        return new ServiceResult<Postage>(obj);
    }
}