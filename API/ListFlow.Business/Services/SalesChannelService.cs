using System.Collections.Generic;
using ListFlow.Domain.Model;
using System.Linq;
using ListFlow.Business.SalesChannels;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Business.Services
{

    public class SalesChannelService : ISalesChannelService
    {
        private readonly ISalesChannelRepository _salesChannels;

        public SalesChannelService(ISalesChannelRepository salesChannelService){
            _salesChannels = salesChannelService;
        }

        public ServiceResult<SalesChannel> Create(string name)
        {
            // Check if a channel with the same name already exists
            if (_salesChannels.FindByName(name.ToLower()) != null)
            {
                return new ServiceResult<SalesChannel>("A sales channel with this name already exists.");
            }

            var newChannel = new SalesChannel
            {
                Name = name
            };

            _salesChannels.Add(newChannel);

            return new ServiceResult<SalesChannel>(newChannel);
        }

        public ServiceResult<SalesChannel> Delete(Guid id)
        {
             var channel = _salesChannels.FindById(id);

            if (channel == null)
            {
                return new ServiceResult<SalesChannel>("Sales channel not found.");
            }

            

            return new ServiceResult<SalesChannel>(channel);
        }

        public ServiceResult<IEnumerable<SalesChannel>> GetAll()
        {
            return new ServiceResult<IEnumerable<SalesChannel>>(_salesChannels.GetAll());
        }

        public ServiceResult<SalesChannel> GetById(Guid id)
        {
            var channel = _salesChannels.FindById(id);

            if (channel == null)
            {
                return new ServiceResult<SalesChannel>("Sales channel not found.");
            }

            return new ServiceResult<SalesChannel>(channel);
        }

        public ServiceResult<SalesChannel> Update(SalesChannel channel)
        {
            throw new NotImplementedException();
        }
    }
}
