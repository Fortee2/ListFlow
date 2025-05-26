using ListFlow.Domain.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;
using ListFlow.Infrastructure.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace ListFlow.Infrastructure.Repository;

public class ListingRepository(ApplicationDbContext context)
    : BaseRepository<Listing>(context), IListingRepository
{
    public Listing? FindByItemNumberAsync(string itemNumber)
    {
        try
        {
            var listing =  _dbContext.Listings.Where(w => w.ItemNumber == itemNumber).FirstOrDefault();
            return listing;
        }
        catch (Exception e)
        {
            Console.WriteLine(itemNumber);
            Console.WriteLine(e);
            throw;
        }
    }

    public Listing? FindByTitle(string listingTitle)
    {
        var listing = (from list in _dbContext.Listings
            where list.ItemTitle.ToLower() == listingTitle.ToLower()
            select list).FirstOrDefault();

        return listing;
    }

    /// <summary>
    ///     Finds the crossposted listing associated with the item number passed in.
    /// </summary>
    /// <param name="itemNumber">The item number to find its corresponding listing for.</param>
    /// <returns>The matching listing to the one searched</returns>
    public  List<Listing>? FindCrossPostListingByItemNumberAsync(string itemNumber)
    {
        var listing = FindByItemNumberAsync(itemNumber);

        if (listing != null)
        {
            var listings = (from list in _dbContext.Listings.Include(l => l.SalesChannel)
                where list.ItemNumber.ToLower() != itemNumber.ToLower()
                      && list.CrossPostId == listing.CrossPostId
                      && list.CrossPostId != null
                select list).ToList();

            return listings;
        }

        return null;
    }

    public IEnumerable<Listing> GetAll()
    {
        var listing = (from list in _dbContext.Listings
            where list.Active
            orderby list.DateListed descending
            select list).AsEnumerable();

        return listing;
    }

    public async Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter)
    {
        var query = _dbContext.Listings.AsQueryable();

        if (!string.IsNullOrEmpty(filter.SalesChannel))
            query = query.Where(l => l.SalesChannel.Id.ToString() == filter.SalesChannel);

        if (!string.IsNullOrEmpty(filter.ItemNumber)) query = query.Where(l => l.ItemNumber == filter.ItemNumber);

        if (!string.IsNullOrEmpty(filter.ItemTitle)) query = query.Where(l => l.ItemTitle.Contains(filter.ItemTitle));

        if (filter.DateRange != null)
            query = query.Where(l =>
                l.DateListed >= filter.DateRange.StartDate && l.DateListed <= filter.DateRange.EndDate);

        var listings = await query.ToListAsync();

        return listings;
    }

    public Dictionary<string, string> GetSoldListings()
    {
        var listing = (from list in _dbContext.Listings
            join scList in _dbContext.Listings on list.CrossPostId equals scList.CrossPostId
            where list.DateSold != null
                  && scList.Active
                  && list.SalesChannel.Id != scList.SalesChannel.Id
            orderby list.Price descending
            select new
            {
                scList.SalesChannel.Name,
                scList.ItemNumber
            }).ToDictionary(x => x.ItemNumber, x => x.Name);

        return listing;
    }

    public IEnumerable<CrossListingResult> ItemsToCrossList(Guid anchorSalesChannel)
    {
        var listing = (from list in _dbContext.Listings
            join channels in _dbContext.SalesChannels on list.SalesChannel.Id equals channels.Id
            where list.Active
                  && list.SalesChannel.Id == anchorSalesChannel
                  && list.CrossPostId == null
            orderby list.LastUpdated
            select new CrossListingResult
                { SalesChannel = channels, ItemNumber = list.ItemNumber, Title = list.ItemTitle }).AsEnumerable();

        return listing;
    }

    public IEnumerable<CrossListingResult> ItemsNotUpdated(Guid salesChannel)
    {
        var listing = (from list in _dbContext.Listings
            join channels in _dbContext.SalesChannels on list.SalesChannel.Id equals channels.Id
            where list.Active
                  && list.SalesChannel.Id == salesChannel
            orderby list.LastUpdated
            select new CrossListingResult
                { SalesChannel = channels, ItemNumber = list.ItemNumber, Title = list.ItemTitle }).AsEnumerable();

        return listing;
    }
    
    public IEnumerable<SkuResult> AssociateSku(string salesChannelName)
    {
        var listing = (from list in _dbContext.Listings
            join inven in _dbContext.Inventories on list.CrossPostId equals inven.Id
            where list.Active
                  && list.SalesChannel.Name == salesChannelName
            select new SkuResult(){ItemNumber = list.ItemNumber, Sku = inven.Sku} ).AsEnumerable();

        return listing;
    }
}