using System.Net;
using System.Runtime.InteropServices.JavaScript;
using HtmlAgilityPack;
using MimeKit;

namespace ListFlow.Email.Templates;

public abstract class EtsySoldTemplate:IEmailTemplate
{
    public static AuctionData ExtractData(MimeMessage email)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(email.HtmlBody);
        var itemTitle =  doc.DocumentNode.SelectNodes("//td[@class='right']/div[@class='normal-copy copy']/a").First().InnerHtml.Trim();
        if (!string.IsNullOrEmpty(itemTitle))
        {
            itemTitle = WebUtility.HtmlDecode(itemTitle);
        }
        
        var orderTotal = doc.DocumentNode
            .SelectNodes("//td[@class='right']/div[@class='normal-copy copy']").First(w => w.InnerText.Contains(("Price"))).InnerText;
        
        orderTotal = !string.IsNullOrEmpty(orderTotal) ? orderTotal.Split("\n")[1].Trim().Replace("$", "") : "0";

        var parsedDate = email.Date.DateTime;
        try
        {
            var actualDate =   doc.DocumentNode
                .SelectNodes("//div[@class='fifty50-left']/table/tr/td/div[@class='normal-copy copy']").First().InnerText;

            var datePortion = actualDate.Substring(actualDate.IndexOf("on") + 3).Trim();
            parsedDate = DateTime.Parse(datePortion);    
        }catch (FormatException e)
        {
            var subjectParts = email.Subject.Split("-");
            var datePortion = subjectParts[1].Trim();
            datePortion = datePortion.Replace("Ship by", "").Trim();
            datePortion = string.Format("{0}, 2024", datePortion);
            parsedDate = DateTime.Parse(datePortion);
        }
        
        return  new AuctionData("", itemTitle, parsedDate  , orderTotal);
    }
}