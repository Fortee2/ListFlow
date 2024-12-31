using ListFlow.Email.Clients;
using ListFlow.Email.Templates;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;
using Org.BouncyCastle.Crypto.Engines;

namespace ListFlow.Email;

public class EmailDownloader(string address, string password, string domain, string subject)
{
    public List<MimeMessage> DownloadEmails()
    {
        using var client = new ImapClient();
        client.Connect(domain, 993, true);
        client.Authenticate(address, password);

        var inbox = client.Inbox;
        inbox.Open(MailKit.FolderAccess.ReadOnly);
    
        var query = SearchQuery.All;
        var uids = inbox.Search(query);

        var emails = new List<MimeMessage>();
        var count = 0;
        foreach (var uid in uids)
        {
            var message = inbox.GetMessage(uid);
            emails.Add(message);
            count++;

            if (count == 100)
            {
                break;
            }
        }

        client.Disconnect(true);

        return emails;
    }

    public List<MimeMessage> ExtractFromMbox(string mboxFilePath)
    {
        return MboxProcessor.ProcessMboxFile(mboxFilePath);
    }

    public async Task SearchKeyword(List<MimeMessage> emails)
    {
        using var imapClient = new ImapClient();
        var soldClient = new ListingClient();
        imapClient.Connect(domain, 993, true);
        imapClient.Authenticate(address, password);

        var inbox = imapClient.Inbox;
        inbox.Open(MailKit.FolderAccess.ReadWrite);

        foreach (var email in emails)
        {
            Console.WriteLine(email.From.FirstOrDefault()?.Name );
            if (email.From.FirstOrDefault()?.Name == "eBay")
            {
                try
                {
                    if (email.Subject.StartsWith("You made the sale"))
                    {
                        var extractedData = EbaySoldTemplate.ExtractData(email);
                        await soldClient.MarkSold(extractedData);
                    }
                    else if (email.Subject.EndsWith("has been listed"))
                    {
                        var extractedData = EbayListingTemplate.ExtractData(email);
                        await soldClient.AddMissingListing(extractedData);
                    }
                } catch( Exception e)
                {
                    Console.WriteLine(e.Message);
                }
                
                var uid = await inbox.SearchAsync(SearchQuery.HeaderContains("Subject", email.Subject));

                if (uid.Any())
                {
                    await inbox.AddFlagsAsync(uid.FirstOrDefault(), MessageFlags.Deleted, true);
                }
                    
            }
         
        }

        await inbox.ExpungeAsync();
        await imapClient.DisconnectAsync(true);
    }
}