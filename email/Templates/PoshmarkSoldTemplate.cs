using HtmlAgilityPack;
using MimeKit;

namespace ListFlow.Email.Templates;

public class PoshmarkSoldTemplate:IEmailTemplate
{
    public static AuctionData ExtractData(MimeMessage email)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(email.HtmlBody);
        
        var start = body.IndexOf("<td class=\"price\"");
        var end = body.IndexOf("</td>", start);
        
        var price = body[start..end].Trim().Replace("$", "");
        
        var orderIdNode = doc.DocumentNode.SelectSingleNode("//td[text()='Order ID']/following-sibling::tr/td");

        start = 0;
        end = email.Subject.IndexOf('"', 1 );
        var subject = email.Subject.Substring(start, end-1);
        
        return  new AuctionData(orderIdNode.InnerText, subject, email.Date.DateTime, price);
    }
}