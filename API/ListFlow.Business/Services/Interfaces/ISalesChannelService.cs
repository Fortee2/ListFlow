using System.Collections.Generic;
using ListFlow.Domain.Model;

namespace ListFlow.Business.SalesChannels
{
    public interface ISalesChannelService
    {
        ServiceResult<SalesChannel> Create(string name);
        ServiceResult<IEnumerable<SalesChannel>> GetAll();
        ServiceResult<SalesChannel> GetById(Guid id);
        ServiceResult<SalesChannel> Delete(Guid id);

        ServiceResult<SalesChannel> Update(SalesChannel channel);
    }
}
