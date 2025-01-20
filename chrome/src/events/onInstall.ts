export default class OnInstall {
    private chrome: any;

    constructor(chrome: any) {
        this.chrome = chrome;
    }

    public async create() {
         // Set Default Settings
        chrome.storage.sync.get({
            serverURI: null,
            createExport: null,
            removeInactiveListings: null,
        }, function(data) {
            if (data.serverURI === null) {
            chrome.storage.sync.set({ serverURI: "http://demo.api.com" }, function() {
                console.log('Default serverURI saved.');
            });
            }
        
            if (data.createExport === null) {
            chrome.storage.sync.set({ createExport: false }, function() {
                console.log('Default createExport saved.');
            });
            }
        
            if (data.ebayLastInactive === null) {
            chrome.storage.sync.set({ ebayLastInactive: "2024-01-01" }, function() {
                console.log('Default ebayLastInactive saved.');
            });
            }
        
            if (data.removeInactiveListings === null) {
            chrome.storage.sync.set({ removeInactiveListings: false }, function() {
                console.log('Default removeInactiveListings saved.');
            });
            }
        });
    }
}