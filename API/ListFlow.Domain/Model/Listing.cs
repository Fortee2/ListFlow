using System;
namespace ListFlow.Domain.Model
{
    public class Listing
    {
        public Guid Id { get; set; }
        public string ItemTitle { get; set; }
        public string Description { get; set; }
        public Guid InventoryId { get; set; }
        public Guid SalesChannelId { get; set; }
    }
}

