using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;
using Microsoft.Extensions.Caching.Memory;

namespace ListFlow.Infrastructure.Repository;

public class SalesChannelRepository : BaseRepository<SalesChannel>, ISalesChannelRepository
{
    private readonly IMemoryCache _cache;

    public SalesChannelRepository(ApplicationDbContext context, IMemoryCache memoryCache) : base(context)
    {
        _cache = memoryCache;
    }

    public override void Add(SalesChannel obj)
    {
        obj.Id = new Guid();
        base.Add(obj);
    }

    public SalesChannel? FindByName(string saleChannelName)
    {
        var cacheKey = $"SalesChannel_{saleChannelName.ToLower()}";
        _cache.TryGetValue(cacheKey, out SalesChannel? channel);

        if (channel == null)
        {
            channel = (from schannels in _dbContext.SalesChannels
                where schannels.Name.ToLower() == saleChannelName.ToLower()
                select schannels).FirstOrDefault();

            _cache.Set(cacheKey, channel);
        }

        return channel;
    }

    public IEnumerable<SalesChannel> GetAll()
    {
        var channels = (from sc in _dbContext.SalesChannels
            select sc).AsEnumerable();

        return channels;
    }
}