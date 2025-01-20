export async function removeInactive(){
   async function checkReadyState() {
        return new Promise((resolve, reject) => {
            let timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('Page load timed out after 10 seconds'));
            }, 10000); // 10 seconds timeout
        
            async function check() {
            if(document.readyState === 'complete') {
                clearTimeout(timeoutId);
                console.log('readyState is complete');
                takeAction().then(() => {; 
                    resolve();
                });
            } else {
                console.log('readyState is not complete');
                setTimeout(check, 1000);
            }
            }
        
            check();
        });
    }

    async function takeAction() {
        var inactiveCount = readInactiveItems();

        while(inactiveCount[0] > 0){
            await deleteInactiveItems();
            inactiveCount = readInactiveItems();
            console.log(inactiveCount);
            await delay(3000);
        }
    }

    function delay(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    function readInactiveItems() {
        console.log('readTotalItems');
        const div = document.querySelectorAll('h5[data-testid="FilterCount"]');
        let counts = [div[0].innerHTML , div[1].innerHTML, div[4].innerHTML, div[5].innerHTML];
        return counts;
    }

    async function  deleteInactiveItems() {
        var dropDown = document.querySelector('input[data-testid="SelectAllCheckbox"]');
        if(dropDown){
            dropDown.addEventListener('focus', (e) => {
                console.log('check box focus event fired');
            });
            dropDown.addEventListener('click', (e) => {
                console.log('check box click event fired');
                e.target.checked = true;
            });

            dropDown.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            await delay(3000);
            dropDown.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await delay(3000); 

            console.log(dropDown.checked);

            var deleteAllButton = null;
            if(dropDown.checked){
                do{
                    deleteAllButton = document.querySelector('button[data-testid="DeleteAllButton"]');
                    console.log(deleteAllButton);
                    await delay(3000);
                    if(deleteAllButton){
                        deleteAllButton.focus();
                        deleteAllButton.click();
                        await delay(3000);
                    }
                }while(!deleteAllButton)

                var confirmDeleteButton = null;
                do{
                    confirmDeleteButton = document.querySelector('button[data-testid="ConfirmationDialog-Confirm"]');
                    console.log(confirmDeleteButton);
                    await delay(3000);
                    if(confirmDeleteButton){
                        confirmDeleteButton.focus();
                        confirmDeleteButton.click();
                        await delay(3000);
                    }
                }while(!confirmDeleteButton);
                
            }
        }
    }

    await checkReadyState();
}