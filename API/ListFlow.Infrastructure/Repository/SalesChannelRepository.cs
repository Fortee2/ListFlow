using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Repository.Interface;
using System.Linq;
using System.Text;

namespace ListFlow.Infrastructure.Repository
{
    public partial class SalesChannelRepository : BaseRepository<SalesChannel>, ISalesChannelRepository{
        public SalesChannelRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override void Add(SalesChannel obj)
        {
            obj.Id = new Guid();
            base.Add(obj);
        }

        public SalesChannel? FindByName(string saleChannelName)
        {
            SalesChannel? channel = (from schannels in base._dbContext.SalesChannels
                                where schannels.Name.ToLower() == saleChannelName
                                select schannels).FirstOrDefault();

            return channel;
        }

        public IEnumerable<SalesChannel> GetAll()
        {
            var channels = (from sc in base._dbContext.SalesChannels
                select sc).AsEnumerable();

            return channels;
        }
    }

}

