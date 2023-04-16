using System;
namespace ListFlow.Domain.Model
{

    public class Inventory
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int Quantity { get; set; }
        public decimal Cost { get; set; }
        public decimal Weight { get; set; }
    }

}

