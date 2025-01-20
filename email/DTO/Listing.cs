namespace ListFlow.Email.DTO;

public class Listing
{
 
    public Guid Id { get; set; }
    public required string ItemNumber {get; set;}
    public required string ItemTitle { get; set; }
    public required string Description { get; set; }
    public required SalesChannel SalesChannel { get; set; }

    public bool Active { get; set; }

    public Guid SalesChannelId { get; set; }
    public string? CrossPostId{ get; set;}
    public DateTime? DateListed { get; set; }
    public DateTime? DateEnded { get; set; }
    public DateTime? DateSold { get; set; }
    public DateTime? LastUpdated { get; set; }
    public decimal? Price { get; set; }
}