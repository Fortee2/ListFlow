namespace ListFlow.Domain.Model;

public class Listing
{
    public Guid Id { get; set; }
    public required string ItemNumber { get; set; }
    public required string ItemTitle { get; set; }
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    //public Inventory? Inventory { get; set; }
    public SalesChannel SalesChannel { get; set; }

    public bool Active { get; set; }

    // Foreign keys
    //public Guid InventoryId { get; set; }
    public required Guid SalesChannelId { get; set; }
    public Guid? CrossPostId { get; set; }
    public DateTime? DateListed { get; set; }
    public DateTime? DateEnded { get; set; }
    public DateTime? DateSold { get; set; }
    public DateTime? LastUpdated { get; set; }
    public decimal? Price { get; set; }

    /*public Postage? Postage { get; set; }*/
}