import { FormEventHandler, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchListingsByFilter, getListings } from './listingSlice';
import { Listing } from './listing';

const ListingComponent = () => {
  const dispatch = useAppDispatch();
  const listings = useAppSelector(getListings);
  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    // Fetch all listings on mount
    dispatch(fetchListingsByFilter(filter));
  }, [dispatch, filter]);

  const currentPageListings = () => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return listings.slice(startIndex, endIndex);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  const previousPage = () => {
    setPage(page - 1);
  };

  const handleFilterChange = (event: { target: { name: any; value: any; }; }) => {
    const { name, value } = event.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <div>
      <h1>Listings</h1>
      <form>
        <label>
          Sales Channel:
          <input type="text" name="salesChannel" onChange={handleFilterChange} />
        </label>
        <label>
          Item Number:
          <input type="text" name="itemNumber" onChange={handleFilterChange} />
        </label>
        <label>
          Start Date:
          <input type="date" name="startDate" onChange={handleFilterChange} />
        </label>
        <label>
          End Date:
          <input type="date" name="endDate" onChange={handleFilterChange} />
        </label>
      </form>
      <ul>
        {currentPageListings().map((listing) => (
          <li key={listing.id}>
            {listing.itemTitle} - {listing.itemNumber} - {listing.salesChannel}
          </li>
        ))}
      </ul>
      <button onClick={previousPage} disabled={page === 1}>
        Previous Page
      </button>
      <button onClick={nextPage} disabled={currentPageListings().length < pageSize}>
        Next Page
      </button>
    </div>
  );
};

export default ListingComponent;