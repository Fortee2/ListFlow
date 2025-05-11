using ListFlow.Domain.Model;

namespace ListFlow.Domain.DTO;

public struct CrossListingResult
{
    public SalesChannel SalesChannel { get; set; }
    public string ItemNumber { get; set; }
    public string Title { get; set; }
}