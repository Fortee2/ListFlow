export default interface IListing 
{
    itemNumber: string,
    itemTitle: string,
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