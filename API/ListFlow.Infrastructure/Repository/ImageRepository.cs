using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository;

public class ImageRepository: BaseRepository<Images>
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
}