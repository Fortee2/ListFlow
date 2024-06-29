using System;

namespace ListFlow.Domain.Model
{
    public class Images
    {
        public Guid Id { get; set; }
        public required string ItemNumber {get; set;}
        public required string ImageUrl { get; set; }
        public required string ImageFile { get; set; }
        public DateTime? LastUpdated { get; set; }

    }
}


