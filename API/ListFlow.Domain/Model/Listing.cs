using System;

namespace ListFlow.Domain.Model
{
    public class Listing
    {
        public Guid Id { get; set; }
        public string ItemNumber {get; set;}
        public string ItemTitle { get; set; }
        public string Description { get; set; }
        
        // Navigation properties
        public Inventory Inventory { get; set; }
        public SalesChannel SalesChannel { get; set; }

        // Foreign keys
        public Guid InventoryId { get; set; }
        public Guid SalesChannelId { get; set; }
    }
}


