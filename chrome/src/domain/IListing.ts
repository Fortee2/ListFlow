export default interface IListing 
{
  id: string,
  itemNumber: string,
  itemTitle: string,
  active: boolean,
  salesChannelId: string,
  price: string,
  shipping: {
    majorWeight: number,
    minorWeight: number,
    packageLength: number,
    packageWidth: number,
    packageHeight: number,
  },
  images: string[],
  description: string,
}