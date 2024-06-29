using ListFlow.Business.DTO;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;
using Org.BouncyCastle.Bcpg.Attr;

namespace ListFlow.Business.Services;

public class ImageService:  IImageService
{
    private readonly IImageRepository _imageRepository;
    
    public ImageService(IImageRepository imageRepository)
    {
        _imageRepository = imageRepository;
    }
    
    public IEnumerable<Images>? FindByItemNumber(string itemNumber)
    {
        if (String.IsNullOrEmpty(itemNumber))
            throw new ArgumentNullException(nameof(itemNumber));
        
        var imgs = _imageRepository.FindByItemNumber(itemNumber);

        return imgs;
    }

    public async Task Create(ImageDto obj)
    {
        await Create(new Images()
        {
            ImageFile = obj.ImageFile,
            ImageUrl = obj.ImageFile,
            ItemNumber = obj.ItemNumber,
            LastUpdated = DateTime.Now
        });
        
    }

    public async Task Create(Images obj)
    {
        await _imageRepository.AddAsync(obj);
    }

    public Task Delete(Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Images>> GetAll()
    {
        throw new NotImplementedException();
    }

    public Task<Images> GetById(Guid id)
    {
        throw new NotImplementedException();
    }

    public Task<Images> Update(Images obj)
    {
        throw new NotImplementedException();
    }
}