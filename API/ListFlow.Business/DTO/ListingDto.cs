using System;

namespace ListFlow.Business.DTO
{
    public class ListingDTO
    {
        public ListingDTO()
        {
            Description = "";
        }

        public required string ItemNumber {get; set;}
        public required string ItemTitle { get; set; }
        public string Description { get; set; }
        public required string SalesChannel { get; set; }
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

    }

}


