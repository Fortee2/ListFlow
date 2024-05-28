namespace ListFlow.Domain.Model;

public class Postage
{
    public Guid Id { get; set; }
    public string ShippingService { get; set; } = string.Empty;
    public int Pounds { get; set; } = 0;
    public int Ounces { get; set; } = 0;    
    public int Length { get; set; } = 0;
    public int Width { get; set; } = 0;
    public int Height { get; set; } = 0;
}