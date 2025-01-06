using HtmlAgilityPack;
using MimeKit;

namespace ListFlow.Email.Templates;

public abstract class PoshmarkSoldTemplate:IEmailTemplate
{
    public static AuctionData ExtractData(MimeMessage email)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(email.HtmlBody);

        var orderIdNode = doc.DocumentNode.SelectNodes("//td").First(w => w.InnerText == "Order ID").ParentNode
            .NextSibling.SelectSingleNode("td").InnerText;
        var dateSoldNode = doc.DocumentNode.SelectNodes("//td").First(w => w.InnerText == "Order Date")
            .ParentNode.NextSibling.SelectSingleNode("td").InnerText;
        var orderTotal = doc.DocumentNode.SelectNodes("//td[@class='price']")[1].InnerText;
        
        orderTotal = !string.IsNullOrEmpty(orderTotal) ? orderTotal.Replace("$", "") : "0";
        
        var actualDate = DateTime.Parse(dateSoldNode);

        var end = email.Subject.IndexOf('"', 1 );
        var subject = email.Subject.Substring(0, end);
        
        return  new AuctionData(orderIdNode, subject, actualDate, orderTotal);
    }
}