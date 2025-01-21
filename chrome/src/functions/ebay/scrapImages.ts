export default function scrapImages(itemNumber: string) {
  function checkReadyState(): Promise<void> {
    return new Promise((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Page load timed out after 10 seconds'));
      }, 10000); // 10 seconds timeout

      function check() {
        if (document.readyState === 'complete') {
          clearTimeout(timeoutId);
          console.log('readyState is complete');
          retrieveImages(itemNumber).then(resolve);
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }

      check();
    });
  }

  function retrieveImages(itemNumber: string) : Promise<void> {
    return new Promise((resolve, reject) => {
      try{
        function checkImageElement() {

          let imageElements = document.querySelectorAll('.uploader-thumbnails__inline-edit');
          if (imageElements.length > 0) {
            imageElements.forEach((element) => {
              const backgroundImageString = element.getElementsByTagName('button')[0].getAttribute('style') as string;
              let imageName = element.getElementsByTagName('button')[0].getAttribute('aria-label') as string;
              let imageTitleWords = imageName.split(' ');
              let imageOrder = imageTitleWords[imageTitleWords.length - 1]; 
              const startIdx = backgroundImageString.indexOf('url(') + 4;
              const endIdx = backgroundImageString.indexOf(')');

              let imageUrl = backgroundImageString.substring(startIdx, endIdx);
              console.log(imageUrl);

              let titleFolderName = extractTitle();

              chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: `${itemNumber}_${imageOrder}.jpg`, folderName: titleFolderName });
            });

            resolve();
          } else {
            setTimeout(checkImageElement, 1000); // wait for 1 second before checking again
          }
        }
        
        checkImageElement();
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  function extractTitle(): string {
    let div = document.querySelector('input[name="title"]');
    console.log(div);
    if (div) {
      let itemTitle = div.getAttribute('value') as string;
      console.log(itemTitle);
      itemTitle = itemTitle?.replace(/[^a-zA-Z0-9]/g, '_');
      itemTitle = itemTitle?.replace(/_+/g, '_');
      return itemTitle;
    }

    return '';
  }

  checkReadyState().then(() => { return; }).catch((error) => console.error(error));
}