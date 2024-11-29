using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;

public class EmailDownloader
{
    private string address;
    private string password;
    private string domain;
    private string subject;

    public EmailDownloader(string address, string password, string domain, string subject)
    {
        this.address = address;
        this.password = password;
        this.domain = domain;
        this.subject = subject;
    }

    public List<MimeMessage> DownloadEmails()
    {
        using (var client = new ImapClient())
        {
            client.Connect(domain, 993, true);
            client.Authenticate(address, password);

            var inbox = client.Inbox;
            inbox.Open(MailKit.FolderAccess.ReadOnly);

            var query = SearchQuery.SubjectContains(subject);
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
    }

    public async Task SearchKeyword(List<MimeMessage> emails)
    {
        const string keyword = "Item number:";
        const string phraseEnd = "Quantity sold:";

        using (var imapClient = new ImapClient())
        {
            imapClient.Connect(domain, 993, true);
            imapClient.Authenticate(address, password);

            var inbox = imapClient.Inbox;
            inbox.Open(MailKit.FolderAccess.ReadWrite);

            foreach (var email in emails)
            {
                var body = email.HtmlBody;
                var start = body.IndexOf(keyword);
                var end = body.IndexOf(phraseEnd);

                var dataSection = body[start..end].Trim().Split('\n');

                var itemNumber = dataSection[3].Trim();
                start = body.IndexOf("Date sold:");
                dataSection = body[start..end].Trim().Split('\n');

                var dateSold = dataSection[3].Trim();

                Console.WriteLine("{0} - {1}", itemNumber, dateSold);

                ApiClient client = new ApiClient();

                var data = new
                {
                    soldDate = dateSold
                };

                try{
                     //This function throws an exception if the response is not successful
                    await client.PutAsync(string.Format("http://listflow-api.fenchurch.tech/api/listing/{0}/sold", itemNumber), data).ConfigureAwait(false);
                    var uid = await inbox.SearchAsync(SearchQuery.HeaderContains("Subject", email.Subject));
                    await inbox.AddFlagsAsync(uid.FirstOrDefault(), MessageFlags.Deleted, true);
                }catch(Exception e){
                    Console.WriteLine(e.Message);
                }
            }

            await inbox.ExpungeAsync();
            await imapClient.DisconnectAsync(true);
        }
    }
}
