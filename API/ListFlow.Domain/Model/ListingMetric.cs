using System;
namespace ListFlow.Domain.Model
{
	public class ListingMetric
	{
		public ListingMetric()
		{
		}

        public Guid Id { get; set; }

        public required Listing Listing { get; set; }

        public  Guid ListingId { get; set; }
        public int Views { get; set; }
        public int Likes { get; set; }

        public DateTime? LastUpdated { get; set; }
    }
}

