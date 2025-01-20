using MimeKit;

namespace ListFlow.Email.Templates;

public abstract class EbaySoldTemplate(): IEmailTemplate{
    private const string Keyword = "Item number:";
    private const string PaidKeyword = "Paid";
    private const string PhraseEnd = "Quantity sold:";
    private const string SubjectPrefix = "You made the sale for ";

    public static AuctionData ExtractData(MimeMessage email){
        var body = email.HtmlBody;
        var start = body.IndexOf(PaidKeyword);
        if (start < 0) start = body.IndexOf("Price:");
        var end = body.IndexOf(PhraseEnd);

        var subject = email.Subject.Remove(0, SubjectPrefix.Length);

        var dataSection = body[start..end].Trim().Split('\n');

        var pricePlusShipping = dataSection[3].Trim();
        var priceMinusShipping = pricePlusShipping.Split("+")[0].Replace("$", "").Trim();
        
        start = body.IndexOf(Keyword);
        dataSection = body[start..end].Trim().Split('\n');
        
        var itemNumber = dataSection[3].Trim();
        start = body.IndexOf("Date sold:");
        
        dataSection = body[start..end].Trim().Split('\n');

        var dateSold = dataSection[3].Trim();
        var dateOfSale = DateTime.Parse(dateSold);

        Console.WriteLine("{0} - {1}", itemNumber, dateOfSale);

        return new AuctionData(itemNumber, subject, dateOfSale, priceMinusShipping);

    }

}