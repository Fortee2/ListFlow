import IBaseRequest from './IBaseRequest';
import  IListing  from './IListing';
import  IListingRequest  from './IListingRequest';

export default interface MessageRequest extends IBaseRequest {
  item?: IListingRequest[] | string;  // Can be either array for saveToListingAPI or string for updateDesc
  data?: any[];
  desc?: string;
  salesChannel?: string;
  downloadImages?: boolean;
  listingType?: string;
  listing?: IListing;
}