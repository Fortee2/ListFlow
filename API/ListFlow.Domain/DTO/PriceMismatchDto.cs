using System;

namespace ListFlow.Domain.DTO
{
    public class PriceMismatchDto
    {
        public PriceMismatchDto(string itemNumber, string itemTitle, decimal? price, decimal? crossPostPrice, string crossPostItemNumber, string SalesChannelId, string crossPostSalesChannelId)
        {
            ItemNumber = itemNumber;
            ItemTitle = itemTitle;
            Price = price;
            CrossPostPrice = crossPostPrice;
            CrossPostItemNumber = crossPostItemNumber;
            this.SalesChannelId = SalesChannelId;
            this.CrossPostSalesChannelId = crossPostSalesChannelId;
        }
        
        public string ItemNumber {get; set;}
        public string ItemTitle { get; set; }
        public decimal? Price { get; set; }
        public decimal? CrossPostPrice { get; set; }
        public string CrossPostItemNumber { get; set; }
        public string SalesChannelId { get; set; }
        public string CrossPostSalesChannelId { get; set; }
    }

}


