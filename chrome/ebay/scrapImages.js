export async function scrapEbayImages(itemNumber, downloadImages) {
  function checkReadyState() {
    return new Promise((resolve, reject) => {
      let timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Page load timed out after 10 seconds'));
      }, 10000); // 10 seconds timeout

      function check() {
        if (document.readyState === 'complete') {
          clearTimeout(timeoutId);
          console.log('readyState is complete');
          retrieveImages().then(resolve);
        } else {
          console.log('readyState is not complete');
          setTimeout(check, 1000);
        }
      }

      check();
    });
  }

  function retrieveImages() {
    return new Promise((resolve, reject) => {
      function checkImageElement() {
        let imageElement = document.querySelectorAll('.uploader-thumbnails__inline-edit');
        if (imageElement) {
          let count = 0;
          imageElement.forEach((element) => {
            const backgroundImageString = element.getElementsByTagName('button')[0].getAttribute('style');

            const startIdx = backgroundImageString.indexOf('url(') + 5;
            const endIdx = backgroundImageString.indexOf('\')');

            console.log('retrieveImages');

            let imageUrl = backgroundImageString.substring(startIdx, endIdx);
            console.log(imageUrl);
            chrome.runtime.sendMessage({ action: 'downloadImage', url: imageUrl, filename: `${itemNumber}_${count}.png`, itemNumber: itemNumber });
            count++;
          });

          resolve();
        } else {
          setTimeout(checkImageElement, 1000); // wait for 1 second before checking again
        }
      }

      if (downloadImages) {
        checkImageElement();
      } else {
        resolve();
      }
    });
  }

  await checkReadyState();
}