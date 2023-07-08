using System;

namespace ListFlow.Domain.Model
{
    public class Listing
    {
 
        public Guid Id { get; set; }
        public required string ItemNumber {get; set;}
        public required string ItemTitle { get; set; }
        public required string Description { get; set; }
        
        // Navigation properties
        //public Inventory? Inventory { get; set; }
        public required SalesChannel SalesChannel { get; set; }

        // Foreign keys
        //public Guid InventoryId { get; set; }
        public Guid SalesChannelId { get; set; }
    }
}


