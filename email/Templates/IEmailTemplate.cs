using MimeKit;

namespace ListFlow.Email.Templates;

public interface IEmailTemplate
{
    static abstract AuctionData ExtractData(MimeMessage email);
}