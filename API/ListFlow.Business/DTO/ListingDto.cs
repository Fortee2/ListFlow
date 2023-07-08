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

        public bool Active { get; set; }
    }
}


