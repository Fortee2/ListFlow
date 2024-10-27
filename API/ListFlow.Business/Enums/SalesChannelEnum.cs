using System;

namespace ListFlow.Business.Enums;

public record SalesChannelConstants
{
    public static readonly Guid Etsy = new Guid("d59f7ad3-1b2e-4347-bb4c-807d673d3536");
    public static readonly Guid eBay = new Guid("28e91dfe-9a9d-482d-4aed-08db50d0bd42");
    public static readonly Guid Mercari = new Guid("1411f7bd-3872-4543-812c-f1b81569be89");
    public static readonly Guid Poshmark = new Guid("4d1eb491-3cb3-11ef-b0b3-12c1c7382e63");
}
