using System.Diagnostics;
using ListFlow.Email.Clients;
using ListFlow.Email.Templates;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Parameters;

namespace ListFlow.Email;

public class EmailDownloader(string address, string password, string domain, string subject)
{
    public List<(MimeMessage, UniqueId)> DownloadEmails()
    {
        using var client = new ImapClient();
        client.Connect(domain, 993, true);
        client.Authenticate(address, password);

        var inbox = client.Inbox;
        inbox.Open(MailKit.FolderAccess.ReadOnly);
    
        var query = SearchQuery.All;
        var uids = inbox.Search(query);

        var emails = new List<(MimeMessage Message, UniqueId Uid)>();
        foreach (var uid in uids)
        {
            var message = inbox.GetMessage(uid);
            emails.Add((message, uid));
        }

        client.Disconnect(true);

        return emails;
    }

    public List<MimeMessage> ExtractFromMbox(string mboxFilePath)
    {
        return MboxProcessor.ProcessMboxFile(mboxFilePath);
    }

    public async Task SearchKeyword(List<(MimeMessage message, UniqueId uniqueId)>  emails)
    {
        using var imapClient = new ImapClient();
        var soldClient = new ListingClient();
        imapClient.Connect(domain, 993, true);
        imapClient.Authenticate(address, password);

        var inbox = imapClient.Inbox;
        inbox.Open(MailKit.FolderAccess.ReadWrite);

        foreach (var email in emails)
        {
            try
            {
                Console.WriteLine(email.message.From.FirstOrDefault()?.Name );
            
                switch (email.message.From.FirstOrDefault()?.Name)
                {
                    case "eBay":
  
                        if (email.message.Subject.StartsWith("You made the sale"))
                        {
                            var extractedData = EbaySoldTemplate.ExtractData(email.message);
                            await soldClient.MarkSold(extractedData);
                            await inbox.AddFlagsAsync(email.uniqueId, MessageFlags.Deleted, true);
                        }
                        else if (email.message.Subject.EndsWith("has been listed"))
                        {
                            var extractedData = EbayListingTemplate.ExtractData(email.message);
                            await soldClient.AddMissingListing(extractedData);
                            await inbox.AddFlagsAsync(email.uniqueId, MessageFlags.Deleted, true);
                        }
             
                        
                        break;
                    case "Poshmark":
                        if(email.message.Subject.Contains(" just sold to "))
                        {
                            var extractedData = PoshmarkSoldTemplate.ExtractData(email.message);
                            await soldClient.MarkSold(extractedData);
                            await inbox.AddFlagsAsync(email.uniqueId, MessageFlags.Deleted, true);
                        }
                        break;
                }

            } 
            catch( Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }

        await inbox.ExpungeAsync();
        await imapClient.DisconnectAsync(true);
    }
}