namespace ListFlow.Business.DTO;

public class InventoryDto
{
    public required string Name { get; set; }
    public int Quantity { get; set; }
    public decimal Cost { get; set; }
    public decimal Weight { get; set; }

    public string? Sku { get; set; }
}