using System;

namespace ListFlow.Domain.DTO
{
    public class PriceMismatchDto
    {
        public PriceMismatchDto(string itemNumber, string itemTitle, decimal? price, decimal? crossPostPrice, string crossPostItemNumber)
        {
            ItemNumber = itemNumber;
            ItemTitle = itemTitle;
            Price = price;
            CrossPostPrice = crossPostPrice;
            CrossPostItemNumber = crossPostItemNumber;
        }
        
        public string ItemNumber {get; set;}
        public string ItemTitle { get; set; }
        public decimal? Price { get; set; }
        public decimal? CrossPostPrice { get; set; }
        public string CrossPostItemNumber { get; set; }
    }

}


