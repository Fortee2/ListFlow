using MailKit;
using MimeKit;

namespace ListFlow.Email.Clients;

public class MboxProcessor
{
    public static List<MimeMessage> ProcessMboxFile(string mboxFilePath)
    {
        var emails = new List<MimeMessage>();
        using (var stream = File.OpenRead(mboxFilePath))
        {
            // Load every message from a Unix mbox
            var parser = new MimeKit.MimeParser (stream, MimeKit.MimeFormat.Mbox);
            while (!parser.IsEndOfStream) {
                var message = parser.ParseMessage ();
                emails.Add(message);
            }
        }
        
        return emails;
    }


}