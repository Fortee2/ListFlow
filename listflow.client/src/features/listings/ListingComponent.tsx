import { useDispatch, useSelector } from 'react-redux';
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
  }, []);

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
      title: target.title.value,
      description: target.description.value,
      salesChannel: 'EBAY',
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
      <ul>
        {listings.map(listing => (
          <li key={listing.id} onClick={() => handleSelectListing(listing.id)}>
            {listing.title}
          </li>
        ))}
      </ul>

      <hr />

      <h2>Selected Listing</h2>
      {selectedListing && (
        <>
          <p>{selectedListing.title}</p>
          <button onClick={() => handleUpdateListing(selectedListing)}>Save Changes</button>
          <button onClick={() => handleDeleteListing(selectedListing.id)}>Delete Listing</button>
        </>
      )}

      <hr />

      <h2>Create a New Listing</h2>
      <form onSubmit={handleCreateListing}>
        <input type="text" name="itemNumber" />
        <input type="text" name="title" />
        <input type="text" name="description" />
        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
};

export default ListingComponent;