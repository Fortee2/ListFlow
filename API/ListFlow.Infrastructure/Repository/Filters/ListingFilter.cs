using System;

namespace ListFlow.Infrastructure.Filters{

    public class ListingFilter
    {
        public string? SalesChannel { get; set; }
        public string? ItemNumber { get; set; }
        public string? ItemTitle { get; set; }
        public DateRange? DateRange { get; set; }
    }

}