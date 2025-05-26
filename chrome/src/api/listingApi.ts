import IAssignSku from "../domain/IAssignSku";
import IListingRequest from "../domain/IListingRequest";
import ListItem from "../domain/IListItem";

export default class ListingApi {
  private readonly serverURI: string;

  constructor(serverURI:string) {
    this.serverURI = serverURI; 
  }

  async getListings() {
    try {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      } 
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  }

  async saveItemToDatabase(item: IListingRequest[]) {
   try {
     let jsonItem = JSON.stringify(item, null, 2); // Pretty print the JSON
     
     const response = await fetch(`${this.serverURI}/api/BulkListing`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: jsonItem,
     });
  
     if (!response.ok) {
       console.error("Failed to save item to the database:", item);
     }
   } catch (error) {
     console.error("Error saving item to the database:", error);
   }
  }

  async  saveDescToDatabase(desc: string, itemNumber: string) {
   try {
     const response = await fetch(`${this.serverURI}/api/listing/${itemNumber}/description`, {
       method: "Put",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({description:desc}),
     });
  
     if (!response.ok) {
       console.error("Failed to save item to the database:", desc);
     }
   } catch (error) {
     console.error("Error saving item to the database:", error);
   }
  }

  async markAsInactive(itemNumber: string) {
    try {
      const response = await fetch(`${this.serverURI}/api/listing/${itemNumber}/inactive`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        console.error("Failed to mark item as inactive:", itemNumber);
      }
    }
    catch (error) {
      console.error("Error marking item as inactive:", error);
      // Handle the error appropriately
    }
  }

  async getUnmatchedItems(salesChannel: string): Promise<ListItem[] | null> {
    try {
      const result = await new Promise<{ serverURI?: string }>((resolve) => {
        chrome.storage.sync.get(['serverURI'], (items) => resolve(items));
      });

      if (!result.serverURI) {
        return null;
      }

      const response = await fetch(`${result.serverURI}/api/Listing/${salesChannel}/verifyPosts`);
      const data: ListItem[] = await response.json();
      return data;
    } catch (error) {
        console.error('Error:', error);
      return null;
    }
  }

  async getSkuToAssign(salesChannel: string): Promise<IAssignSku[] | null> {
    try {
      const result = await new Promise<{ serverURI?: string }>((resolve) => {
        chrome.storage.sync.get(['serverURI'], (items) => resolve(items));
      });

      if (!result.serverURI) {
        return null;
      }

      const response = await fetch(`${result.serverURI}/api/Listing/Mercari/skuToAssign`);
      const data: IAssignSku[] = await response.json();
      return data;
    } catch (error) {
        console.error('Error:', error);
      return null;
    }
  }
}
