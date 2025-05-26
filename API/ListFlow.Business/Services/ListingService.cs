using ListFlow.Business.DTO;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.DTO;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure.Filters;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;

namespace ListFlow.Business.Services;

public class ListingService : IListingService
{
    private readonly IInventoryService _inventoryService;
    private readonly IListingMetricRepository _listingMetrics;
    private readonly IListingRepository _listings;
    private readonly ISalesChannelRepository _salesChannels;

    public ListingService(IListingRepository listingRepository,
        ISalesChannelRepository salesChannelRepository,
        IListingMetricRepository listingMetricRepository,
        IInventoryService inventoryService)
    {
        _listings = listingRepository;
        _listingMetrics = listingMetricRepository;
        _salesChannels = salesChannelRepository;
        _inventoryService = inventoryService;
    }

    public async Task<ServiceResult<Listing>> Create(ListingDTO listing)
    {
        var existing =  _listings.FindByItemNumberAsync(listing.ItemNumber);
        if (existing != null)
        {
            await UpdateListingData(existing, listing).ConfigureAwait(false);
            return new ServiceResult<Listing>(existing);
        }

        var salesChannel = GetSalesChannel(listing);

        if (salesChannel == null)
            return new ServiceResult<Listing>("The Sales Channel associated with this listing does not exist.");

        var newListing = new Listing
        {
            Id = Guid.NewGuid(),
            ItemTitle = listing.ItemTitle,
            ItemNumber = listing.ItemNumber,
            Description = listing.Description,
            SalesChannelId = salesChannel.Id, // Only set the ID, not the navigation property
            Active = listing.Active,
            Price = listing.ConvertedPrice,
            LastUpdated = DateTime.Now
        };

        await _listings.AddAsync(newListing);

        return new ServiceResult<Listing>(newListing);
    }

    public async Task CreateListings(ListingDTO[] listings)
    {
        const int batchSize = 5;
        List<Listing> newListings = new();
        List<Listing> updateListings = new();

        if (!listings.Any()) return;

        foreach (var listingDto in listings)
        {
            try
            {
                var salesChannel = GetSalesChannel(listingDto);
                if (salesChannel == null)
                {
                    throw new Exception($"Sales channel not found for listing {listingDto.ItemNumber}");
                }

                var existing =  _listings.FindByItemNumberAsync(listingDto.ItemNumber);

                if (existing == null)
                {
                    var inventory = (! string.IsNullOrEmpty(listingDto.Sku)
                        ? await CreateInventoryItem(listingDto).ConfigureAwait(false)
                        : null);

                    var newListing = new Listing
                    {
                        Id = Guid.NewGuid(),
                        ItemTitle = listingDto.ItemTitle.Replace("  ", " ").Replace("&amp;", "&"),
                        ItemNumber = listingDto.ItemNumber,
                        Description = listingDto.Description,
                        SalesChannelId = salesChannel.Id,
                        Active = listingDto.Active,
                        DateSold = listingDto.SoldDate,
                        DateListed = listingDto.ListedDate,
                        DateEnded = listingDto.EndedDate,
                        Price = listingDto.ConvertedPrice,
                        LastUpdated = DateTime.Now,
                        CrossPostId = inventory?.Data.Id
                    };

                    newListings.Add(newListing);

                    if (newListings.Count >= batchSize)
                    {
                        await _listings.AddRangeAsync(newListings).ConfigureAwait(false);
                        newListings.Clear();
                    }
                }
                else if (!CompareListing(existing, listingDto))
                {
                    await UpdateListingData(existing, listingDto);
                    updateListings.Add(existing);

                    if (updateListings.Count >= batchSize)
                    {
                        await _listings.UpdateRangeAsync(updateListings).ConfigureAwait(false);
                        updateListings.Clear();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing listing {listingDto.ItemNumber}: {ex.Message}", ex);
            }
        }

        // Save any remaining listings
        if (newListings.Any())
        {
            await _listings.AddRangeAsync(newListings).ConfigureAwait(false);
        }

        if (updateListings.Any())
        {
            await _listings.UpdateRangeAsync(updateListings).ConfigureAwait(false);
        }
    }

    public async Task CreateMetrics(ListingDTO[] listingDtos)
    {
        List<ListingMetric> newMetrics = new();

        foreach (var listingDto in listingDtos)
        {
            var existing =  _listings.FindByItemNumberAsync(listingDto.ItemNumber);
            if (existing == null) continue;

            var existingMetric = _listingMetrics.FindByItemNumber(listingDto.ItemNumber);

            if (existingMetric == null)
            {
                newMetrics.Add(new ListingMetric
                {
                    Id = Guid.NewGuid(),
                    Listing = existing,
                    Views = listingDto.ConvertedViews,
                    Likes = listingDto.ConvertedLikes,
                    LastUpdated = DateTime.Now
                });

                continue;
            }

            UpdateMeteric(listingDto, existingMetric);
        }

        await _listingMetrics.AddRangeAsync(newMetrics);
    }

    public ServiceResult<Listing> Delete(Guid id)
    {
        try
        {
            var listing = _listings.FindById(id);

            if (listing == null) return new ServiceResult<Listing>("Sales channel not found.");

            _listings.Delete(listing);

            return new ServiceResult<Listing>(listing);
        }
        catch (Exception ex)
        {
            return new ServiceResult<Listing>(ex.Message);
        }
    }

    public ServiceResult<Listing> FindListingsByItemNumber(string itemNumber)
    {
        var listing =  _listings.FindByItemNumberAsync(itemNumber);

        if (listing == null) return new ServiceResult<Listing>("Listing not found.");

        return new ServiceResult<Listing>(listing);
    }

    public ServiceResult<Listing> FindListingsByTitle(string Title)
    {
        var listing = _listings.FindByTitle(Title);

        if (listing == null) return new ServiceResult<Listing>("Listing not found.");

        return new ServiceResult<Listing>(listing);
    }

    public ServiceResult<IEnumerable<Listing>> GetAll()
    {
        return new ServiceResult<IEnumerable<Listing>>(_listings.GetAll());
    }

    public ServiceResult<Listing> GetById(Guid id)
    {
        var channel = _listings.FindById(id);

        if (channel == null) return new ServiceResult<Listing>("Sales channel not found.");

        return new ServiceResult<Listing>(channel);
    }

    public async Task<ServiceResult<Listing>> Update(Listing item)
    {
        await _listings.UpdateAsync(item).ConfigureAwait(false);

        return new ServiceResult<Listing>(item);
    }

    /// <summary>
    ///     Retrieves all listings that match the specified filter criteria.
    /// </summary>
    /// <param name="filter">The filter criteria to apply.</param>
    /// <returns>A collection of listings that match the filter criteria.</returns>
    public async Task<IEnumerable<Listing>> GetAllListingsAsync(ListingFilter filter)
    {
        var listings = await _listings.GetAllListingsAsync(filter);

        return listings;
    }

    /// <summary>
    ///     Retrieves the cross posted listing that matches the specified item number.
    /// </summary>
    /// <param name="itemNumber">The item number to find its corresponding listing for.</param>
    /// <returns>The matching listing to the one searched</returns>
    public  ServiceResult<List<Listing>> GetCrossPostByItem(string itemNumber)
    {
        var listing =  _listings.FindCrossPostListingByItemNumberAsync(itemNumber);

        if (listing == null) return new ServiceResult<List<Listing>>("Listing not found.");

        return new ServiceResult<List<Listing>>(new List<Listing>());
    }

    public async Task MarkSold(string itemNumber, string? soldDate)
    {
        var listing =  _listings.FindByItemNumberAsync(itemNumber);

        if (listing == null) throw new Exception("Listing not found.");

        DateTime parsedDate;

        if (!DateTime.TryParse(soldDate, out parsedDate)) parsedDate = DateTime.Now;

        listing.DateSold = parsedDate;
        listing.Active = false;
        listing.LastUpdated = DateTime.Now;

        await _listings.UpdateAsync(listing).ConfigureAwait(false);
    }

    public async Task MarkInactive(string itemNumber)
    {
        var listing =  _listings.FindByItemNumberAsync(itemNumber);

        if (listing == null) throw new Exception("Listing not found.");

        listing.DateEnded = DateTime.Now;
        listing.Active = false;
        listing.LastUpdated = DateTime.Now;

        await _listings.UpdateAsync(listing).ConfigureAwait(false);
    }


    public ServiceResult<List<ItemNumberResponse>> GetCrossPostSold()
    {
        var result = _listings.GetSoldListings();

        return new ServiceResult<List<ItemNumberResponse>>(result
            .Select(x => new ItemNumberResponse { ItemNumber = x.Key, SalesChannel = x.Value }).ToList());
    }

    public async Task<ServiceResult<string>> UpdateDescription(string itemNumber, string description)
    {
        var listing =  _listings.FindByItemNumberAsync(itemNumber);

        if (listing == null) return new ServiceResult<string>("Listing not found.");

        listing.Description = description;
        listing.LastUpdated = DateTime.Now;

        await _listings.UpdateAsync(listing).ConfigureAwait(false);

        return new ServiceResult<string>(data: "Saved successfully.");
    }

    public List<CrossListingResult> GetListingsToCrossPost(string salesChannelName)
    {
        var salesChannel = _salesChannels.FindByName(salesChannelName);
        if (salesChannel == null) throw new Exception("Sales channel not found.");
        return _listings.ItemsToCrossList(salesChannel.Id).Take(20).ToList();
    }

    public List<CrossListingResult> GetListingsToVerify(string salesChannelName)
    {
        var salesChannel = _salesChannels.FindByName(salesChannelName);
        if (salesChannel == null) throw new Exception("Sales channel not found.");
        return _listings.ItemsNotUpdated(salesChannel.Id).ToList();
    }

    private SalesChannel? GetSalesChannel(ListingDTO listing)
    {
        try
        {
            //Listings are grouped by sales channel, so we only need to check the first one
            var salesChannel = _salesChannels.FindByName(listing.SalesChannel);

            return salesChannel;
        }
        catch (Exception)
        {
            return null;
        }
    }

    private void UpdateMeteric(ListingDTO listingDto, ListingMetric existingMetric)
    {
        existingMetric.Views = listingDto.ConvertedViews;
        existingMetric.Likes = listingDto.ConvertedLikes;
        existingMetric.LastUpdated = DateTime.Now;

        _listingMetrics.Update(existingMetric);
    }

    private async Task<ServiceResult<Inventory>> CreateInventoryItem(ListingDTO listingDto)
    {
        return await _inventoryService.Create(new Inventory
        {
            Name = listingDto.ItemTitle,
            Quantity = listingDto.Quantity,
            Cost = 0,
            Weight = 0,
            Sku = listingDto.Sku
        }).ConfigureAwait(false);
    }

    private async Task UpdateListingData(Listing existing, ListingDTO listingDto)
    {
        existing.ItemTitle = listingDto.ItemTitle.Replace("  ", " ").Replace("&amp;", "&");
        //TOOO: Ebay Descriptions are coming from a separate endpoint because of how they have to be retrieved.
        //Commenting this out for now to prevent overwriting them
        //existing.Description = listingDto.Description;
        existing.Active = listingDto.Active;
        existing.Price = listingDto.ConvertedPrice;
        existing.LastUpdated = DateTime.Now;

        if (listingDto.EndedDate != null)
            existing.DateEnded = listingDto.EndedDate;
        if (listingDto.SoldDate != null)
            existing.DateSold = listingDto.SoldDate;
        if (listingDto.ListedDate != null)
            existing.DateListed = listingDto.ListedDate;

        if (listingDto.Sku != null)
        {
            var inventory = await CreateInventoryItem(listingDto).ConfigureAwait(false);

            if (existing.CrossPostId != inventory.Data.Id) //migrate old crossposts to new inventory item
            {
                var items = GetCrossPostByItem(existing.ItemNumber);

                if (items.Success)
                {
                    var crossPostUpdates = items.Data.Select(item =>
                    {
                        item.CrossPostId = inventory.Data.Id;
                        return item;
                    }).ToList();

                    if (crossPostUpdates.Any())
                    {
                        await _listings.UpdateRangeAsync(crossPostUpdates).ConfigureAwait(false);
                    }

                    existing.CrossPostId = inventory.Data.Id;
                }
            }
        }
        else if (existing.CrossPostId == null)
        {
            var desc = existing.Description?.Trim();
            if (!string.IsNullOrEmpty(desc) && desc.EndsWith(']'))
            {
                var itemNumber = desc.Substring(desc.LastIndexOf('[') + 1);
                itemNumber = itemNumber.Substring(0, itemNumber.Length - 1).Trim();
                var inv = _inventoryService.FindBySku(itemNumber);
                if (inv != null) existing.CrossPostId = inv.Id;
            }
        }
    }

    /// <summary>
    ///     Compare listing and listingDto to see if they are the same
    /// </summary>
    /// <param name="existing">Listing Object from the database</param>
    /// <param name="listingDto">DTO from UI</param>
    /// <returns>True if objects are the same</returns>
    private bool CompareListing(Listing existing, ListingDTO listingDto)
    {
        return existing.ItemTitle == listingDto.ItemTitle &&
               existing.Active == listingDto.Active &&
               existing.Price == listingDto.ConvertedPrice &&
               existing.DateEnded == listingDto.EndedDate &&
               existing.DateSold == listingDto.SoldDate &&
               existing.DateListed == listingDto.ListedDate;
    }

    /// <summary>
    /// Get the assigned Sku from inventory
    /// for the chrome extension to use
    /// </summary>
    /// <param name="salesChannelName">Sells channel to retrieve listings for</param>
    /// <returns>A list of Skus and Item Numbers</returns>
    public IEnumerable<SkuResult> AssociateSku(string salesChannelName)
    {
        return _listings.AssociateSku(salesChannelName);
    }
}
