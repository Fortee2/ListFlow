// See https://aka.ms/new-console-template for more information

using ListFlow.Email;

var mailClient = new EmailDownloader(
    "sales.parser@fenchurch.tech",
    "*9RZYBW_G69yx8f",
    "mail.privateemail.com", 
    "You made the sale for");

var de = mailClient.DownloadEmails();
await mailClient.SearchKeyword(de);

/*var mbox = mailClient.ExtractFromMbox("unprocessed.mbox");
await mailClient.SearchKeyword(mbox);*/
