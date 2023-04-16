function findIframeAndPopulateTextarea(textareaId, content) {
    const iframes = document.getElementsByTagName('iframe');
  
    for (const element of iframes) {
      const iframe = element;
      try {
        const textarea = iframe.contentDocument.getElementsByClassName(textareaId);
        if (textarea) {
            console.log(textarea.item(0).innerHTML);
            setTimeout(function(textarea){ 
                textarea.item(0).innerHTML = "<p>Test</p>"; 
            }, 
            30000);
           //textarea.item(0).innerHTML = "<p>Test</p>";
            //document.getElementsByClassName('se-rte-editor__rich').item(0).innerHTML="<div>Test</div>";
          //textarea.innerHTML = content;
          return true;
        }
      } catch (error) {
        console.error('Unable to access iframe content:', error);
      }
    }
  
    return false;
  }
  
  function populateTextarea(textareaId, content) {
    const success = findIframeAndPopulateTextarea(textareaId, content);
    if (!success) {
      console.error('Textarea not found with ID:', textareaId);
    }
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'populateTextarea') {
      // Wait for the DOM to be fully loaded before attempting to populate the textarea
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          populateTextarea(request.textareaId, request.content);
        });
      } else {
        populateTextarea(request.textareaId, request.content);
      }
    }
  });
  