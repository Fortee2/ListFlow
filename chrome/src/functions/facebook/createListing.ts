import IListing from "../../domain/IListing";

export async function createFacebookListing(ebayListing: IListing): Promise<void> {
    // Local delay function to avoid module resolution issues
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    function checkReadyState(){
      return new Promise<void>(async (resolve, reject) => {
        if(document.readyState === 'complete'){
          console.log('Document is ready');
          await setDescription(ebayListing);
          resolve();
        }else{
          console.log('Document is not ready, checking again in 1 second');
          setTimeout(() => {
            checkReadyState().then(resolve).catch(reject);
          }, 1000);
        }
      }).catch(console.error);
    }

    function setWeight(pounds:number, ounces: number) { 
        let lbSpan = Array.from(document.querySelectorAll('span')).find(
            span => span.textContent?.trim() === 'lb'
        );
    
        if (!lbSpan) {
            setTimeout(() => setWeight(pounds, ounces), 1000);
            return;
        }
        
        const lbInput = lbSpan.parentElement?.getElementsByTagName('input')[0] as HTMLInputElement;

        let ozSpan = Array.from(document.querySelectorAll('span')).find(
            span => span.textContent?.trim() === 'oz'
        );

        if (!ozSpan) {
            return;
        }

        const ozInput = ozSpan.parentElement?.getElementsByTagName('input')[0] as HTMLInputElement;

      if (lbInput) {
          setElementValue(lbInput, pounds.toString());
          setElementValue(ozInput, ounces.toString());
      } 
    }
  
    /*function setPackageDimensions(length, width, height) {
        const el = document.querySelector('input[data-testid="InputLength"]');
        const el2 = document.querySelector('input[data-testid="InputWidth"]');
        const el3 = document.querySelector('input[data-testid="InputHeight"]');
        
        if (el) {
          setElementValue(el, length);
          setElementValue(el2, width);
          setElementValue(el3, height);
        } else {
            setTimeout(() => setPackageDimensions(length, width, height), 1000);
        }
      } 
    */

    async function setDescription(listing: IListing) {
        try{
             // Find span with text "Title"
            let titleSpan = Array.from(document.querySelectorAll('span')).find(
                span => span.textContent?.trim() === 'Title'
            );
        
            if (!titleSpan) {
                throw new Error('Title span not found');
            }

            console.log('Title span found:', titleSpan);
            
            const titleInput = titleSpan.parentElement?.getElementsByTagName('input')[0] as HTMLInputElement;
    
            let descSpan = Array.from(document.querySelectorAll('span')).find(
                span => span.textContent?.trim() === 'Description'
            );

            if (!descSpan) {
                throw new Error('Title span not found');
            }

            const descInput = descSpan?.parentElement?.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;

            let priceSpan = Array.from(document.querySelectorAll('span')).find(
                span => span.textContent?.trim() === 'Price'
            );
        
            if (!priceSpan) {
                throw new Error('Title span not found');
            }

            const priceInput = priceSpan.parentElement?.getElementsByTagName('input')[0] as HTMLInputElement;
            
            console.log('Title input found:', titleInput);
            setElementValue(titleInput, listing.itemTitle);
            console.log(listing.itemTitle);
           
            if (listing.description.length < 1000 - listing.itemNumber.length - 4) {
              listing.description = listing.description + '\n ['+listing.itemNumber+']';
            }
            setElementValue(descInput, listing.description);

            setElementValue(priceInput, listing.price); 

            setWeight(listing.shipping.majorWeight, listing.shipping.minorWeight);
            //setPackageDimensions(listing.shipping.packageLength, listing.shipping.packageWidth, listing.shipping.packageHeight);
            
            //tagListButton(); 
        }catch(e){
          console.log(e);
        }    
      }

    function setElementValue(el : HTMLInputElement | HTMLTextAreaElement, listingValue: string) {
  
        if (el) {
            el.addEventListener('input', (e) => {
                console.log('input event fired');
            });
            el.addEventListener('change', (e) => {
                console.log('change event fired');
            });
            el.addEventListener('focus', (e) => {
                console.log('focus event fired');
            });
            el.addEventListener('keydown', (e) => {
                console.log('keydown event fired');
            });

            el.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            el.value = listingValue;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            let event = new KeyboardEvent('keydown', {bubbles: true,  key: 'Enter' });
            el.dispatchEvent(event);
        }
      }
  
      console.log('createMercariListing');
      await checkReadyState();
  }
