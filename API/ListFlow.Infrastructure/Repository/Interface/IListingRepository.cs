using System;
using ListFlow.Domain.Model;

namespace ListFlow.Infrastructure.Repository.Interface
{
    public interface IListingRepository: ICRUDRepo<Listing>, IRespository<Listing>{
        Listing? FindByTitle(string ListingTitle);
    }
}