namespace ListFlow.Business.DTO;

public class ListingDTO
{
    public ListingDTO()
    {
        Description = "";
        Views = "0";
        Likes = "0";
        Price = "0";
        Quantity = 0;
    }

    public required string ItemNumber { get; set; }
    public required string ItemTitle { get; set; }
    public string Description { get; set; }
    public required string SalesChannel { get; set; }

    public string Views { get; set; }
    public string Likes { get; set; }
    public string Price { get; set; }

    public DateTime? ListingDate { get; set; } //Date from the listing not necessarily the date it was listed
    public short ListingDateType { get; set; }

    public bool Active { get; set; }

    public string? Sku { get; set; }

    public int Quantity { get; set; }
    public DateTime? ListedDate => ListingDateType == 0 ? ListingDate : null;

    public DateTime? EndedDate => ListingDateType == 1 ? ListingDate : null;

    public DateTime? SoldDate => ListingDateType == 2 ? ListingDate : null;

    public int ConvertedViews
    {
        get
        {
            try
            {
                var views = 0;
                int.TryParse(Views, out views);

                return views;
            }
            catch
            {
                return 0;
            }
        }
    }

    public int ConvertedLikes
    {
        get
        {
            try
            {
                return int.Parse(Likes);
            }
            catch
            {
                return 0;
            }
        }
    }

    public decimal ConvertedPrice
    {
        get
        {
            try
            {
                return decimal.Parse(Price);
            }
            catch
            {
                return 0;
            }
        }
    }
}