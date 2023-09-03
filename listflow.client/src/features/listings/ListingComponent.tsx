import { FormEventHandler, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { getListingById, createListing, updateListing, deleteListing, getListings, getAllListings, getSelectedListing } from './listingSlice';
import { Listing } from './listing';

const ListingComponent = () => {
  const dispatch = useAppDispatch();
  const listings = useAppSelector(getListings);
  const selectedListing = useAppSelector(getSelectedListing);

  useEffect(() => {
    // Fetch all listings on mount
    dispatch(getAllListings());
  }, [dispatch]);

  const handleSelectListing = (id: string) => {
    // Fetch a single listing by ID
    dispatch(getListingById(id));
  };

  const handleCreateListing: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      itemNumber: {value: string };
      title: { value: string };
      description: { value: string };
    };
    const listingDTO: Listing = {
      id: '',
      itemNumber: target.itemNumber.value,
      itemTitle: target.title.value,
      salesChannel: 'EBAY',
      active: '1',
      dateEnded: '',  
      dateListed: '',
      dateSold: '',

    };
    dispatch(createListing(listingDTO));
  };

  const handleUpdateListing = (updatedListing: Listing) => {
    // Update an existing listing
    dispatch(updateListing(updatedListing));
  };

  const handleDeleteListing = (id : string) => {
    // Delete a listing by ID
    dispatch(deleteListing(id));
  };

  return (
    <div>
      <h2>All Listings</h2>
      <table>
        <thead>
          <tr>
            <th>Sales Channel</th>
            <th>Item Number</th>
            <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(listing => (
              <tr key={listing.id}>
                <td>{listing.salesChannel}</td>
                <td>{listing.itemNumber}</td>
                <td>{listing.itemTitle}</td>
              </tr>
            ))}
          </tbody>
        </table>


      <hr />

      <h2>Selected Listing</h2>
      {selectedListing && (
        <>
          <p>{selectedListing.itemTitle}</p>
          <button onClick={() => handleUpdateListing(selectedListing)}>Save Changes</button>
          <button onClick={() => handleDeleteListing(selectedListing.id)}>Delete Listing</button>
        </>
      )}

      <hr />

      <h2>Create a New Listing</h2>
      <form onSubmit={handleCreateListing}>
        <label htmlFor="itemNumber">Item Number</label>
        <input type="text" name="itemNumber" />
        <label htmlFor="title">Title</label>
        <input type="text" name="title" />
        <label htmlFor="description">Description</label>
        <textarea cols={80} rows={10} name="description" />
        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
};

export default ListingComponent;