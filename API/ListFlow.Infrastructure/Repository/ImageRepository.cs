using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Infrastructure.Repository;

public class ImageRepository: BaseRepository<Images>, IImageRepository
{
    public ImageRepository(ApplicationDbContext context) : base(context)
    {
    }
    
    public IEnumerable<Images>? FindByItemNumber(string itemNumber)
    {
        var image = (from img in this._dbContext.Images
            where img.ItemNumber.ToLower() == itemNumber.ToLower()
            select img);

        return image;
    }

    public IEnumerable<Images> GetAll()
    {
        throw new NotImplementedException();
    }
}