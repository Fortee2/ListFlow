import  IListing  from './IListing';
import  IListingRequest  from './IListingRequest';

export default interface IMessageRequest {
  action: string;
  itemNumber?: string;
  item?: IListingRequest[] | string;  // Can be either array for saveToListingAPI or string for updateDesc
  majorElement?: string;
  minorElement?: string;
  packageLength?: string;
  packageWidth?: string;
  packageHeight?: string;
  data?: any[];
  desc?: string;
  salesChannel?: string;
  downloadImages?: boolean;
  listingType?: string;
  listing?: IListing;
}