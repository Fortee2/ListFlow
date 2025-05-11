import ImgRequest from "../../domain/ImgRequest";
import { loadTab, closeTab } from "../../utils/tabs";
import { delay, getRandomInt } from "../../utils/utils";
import scrapImages from "../../content/ebay/scrapImages";

export default class ImageQueues {
    private readonly chrome: any;
    private isDownloading: boolean;
    private isDownloadingImage: boolean;
    private readonly ebayImageQueue: string[];
    private readonly imageQueue: ImgRequest[];

    constructor(chrome: any) {
        this.chrome = chrome;
        this.isDownloading = false;
        this.isDownloadingImage = false;
        this.ebayImageQueue = [];
        this.imageQueue = [];
    }

    public addItemToQueue(itemNumber: string) {
        this.ebayImageQueue.push(itemNumber);
        this.processQueue();
    }

    public addItemToDownloadQueue(url: string, filename: string, folderName?: string) {
        this.imageQueue.push( {action:"download",url: url, filename: filename, folderName: folderName } as ImgRequest);
        this.processImageQueue();
    }

    async processImageQueue() {
        if (this.imageQueue.length === 0 || this.isDownloadingImage) {
          return;
        }
      
        this.isDownloadingImage = true;
        let imgRequest = this.imageQueue.shift() as ImgRequest; // dequeue the request
      
        imgRequest.url = imgRequest.url.replace("'", "");

        if(imgRequest.folderName) {
          imgRequest.filename = `${imgRequest.folderName}/${imgRequest.filename}`;
        }

        chrome.downloads.download({
          url: imgRequest.url,
          filename: imgRequest.filename,
          conflictAction: 'overwrite', // Handle filename conflicts by appending a unique identifier
          saveAs: false // Do not show the Save As dialog
        }, function(downloadId) {
          if (chrome.runtime.lastError) {
            console.error("Download failed:", chrome.runtime.lastError);
          } else {
            console.log("Download started with ID:", downloadId);
          }
        });

        this.isDownloadingImage = false;
        await this.processImageQueue(); // recursively process the next request in the queue
      }
      
    async  processQueue(): Promise<void> {
        if (this.ebayImageQueue.length === 0 || this.isDownloading) {
          return;
        }
      
        const itemNumber = this.ebayImageQueue.shift() as string; // dequeue the request  
        this.isDownloading = true;
      
        delay(getRandomInt(5000, 10000));
        const tab = await loadTab(`https://www.ebay.com/sl/list?mode=ReviseItem&itemId=${itemNumber}&ReturnURL=https%3A%2F%2Fwww.ebay.com%2Fsh%2Flst%2Factive%3Foffset%3D600%26limit%3D200%26sort%3DavailableQuantity`);

        await new Promise<void>((resolve) => {
          chrome.scripting.executeScript({
            args: [itemNumber],
            target: { tabId: tab.id as number },
            func: scrapImages,
          }, () => {
            resolve();
          });
        }).then(() => {
          delay(getRandomInt(5000, 10000));
          closeTab(tab.id as number);
        });
      
        this.isDownloading = false;
        await delay(getRandomInt(5000, 1000));
        await this.processQueue(); // recursively process the next request in the queue
    }
}
