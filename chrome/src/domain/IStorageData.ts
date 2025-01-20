import ListItem from "./IListItem";

export default interface IStorageData {
  listData?: ListItem[];
  serverURI?: string;
  createExport?: boolean;
  removeInactiveListings?: boolean;
  lastTimeInactive?: string;
}
