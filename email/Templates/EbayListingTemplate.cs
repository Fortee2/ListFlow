using MimeKit;

namespace ListFlow.Email.Templates;

public abstract class EbayListingTemplate: IEmailTemplate
{
    private const string SubjectPrefix = " has been listed";
    
    public static AuctionData ExtractData(MimeMessage email)
    {
        var body = email.HtmlBody;
        var start = body.IndexOf("Price:");
        var end = body.IndexOf("Listing renews:");
        
        try
        {
            var dataSection = body[start..end].Trim().Split('\n');

            var idx = Array.IndexOf(dataSection, "Item ID:");
            var itemNumber = dataSection[idx + 3].Trim();
            var price = dataSection[3].Trim();
            var dateSold = email.Date.DateTime;
        
            var title = email.Subject.Replace(SubjectPrefix, "");

            return new AuctionData(itemNumber, title, dateSold, price);
        } catch (IndexOutOfRangeException e)
        {
            Console.WriteLine(email.Subject);
            Console.WriteLine("Start: " + start + " End: " + end);
            throw new Exception($"Can't extract data from email: {email.Subject}");
        }
        

    }
}