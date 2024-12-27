namespace ListFlow.Email.DTO;

public class NewListing
{

        public NewListing()
        {
            Description = "";
            Views = "0";
            Likes = "0";
            Price = "0";
        }

        public required string ItemNumber {get; set;}
        public required string ItemTitle { get; set; }
        public string Description { get; set; }
        public required string SalesChannel { get; set; }

        public string Views { get; set; }
        public string Likes { get; set; }
        public string Price { get; set; }

        public DateTime? ListingDate { get; set; } //Date from the listing not necessarily the date it was listed
        public short ListingDateType { get; set; }

        public bool Active { get; set; }

        public DateTime? ListedDate
        {
            get
            {
                return (ListingDateType == 0) ? ListingDate : null;
            }
        }

        public DateTime? EndedDate
        {
            get
            {
                return (ListingDateType == 1) ? ListingDate : null;
            }
        }

        public DateTime? SoldDate
        {
            get
            {
                return (ListingDateType == 2) ? ListingDate : null;
            }
        }

        public  int ConvertedViews
        {
            get
            {
                try
                {
                    int views = 0;
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

        public Decimal ConvertedPrice
        {
            get
            {
                try
                {
                    return Decimal.Parse(Price);
                }
                catch
                {
                    return 0;
                }

            }
        }

    }