namespace ListFlow.Business.DTO;

public record ItemNumberResponse
{
    public string ItemNumber { get; set; } = string.Empty;
    public string SalesChannel {get; set;} = string.Empty;
}