using System;
using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository.Interface
{
    public interface ISalesChannelRepository: ICRUDRepo<SalesChannel>, IRespository<SalesChannel>{
        SalesChannel? FindByName(string saleChannelName);
    }
}