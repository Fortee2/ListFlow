import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { fetchListingsByFilter, getListings } from './listingSlice';
import { fetchSalesChannels, getSalesChannels } from '../saleschannel/salesChannelSlice';

const ListingComponent = () => {
  const dispatch = useAppDispatch();
  const listings = useAppSelector(getListings);
  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    // Fetch all listings on mount
    dispatch(fetchListingsByFilter(filter));
    dispatch(fetchSalesChannels());
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
          <select name="salesChannel" onChange={handleFilterChange}>
            <option value="">All</option>
            {useAppSelector(getSalesChannels).map((salesChannel) => (
              <option key={salesChannel.id} value={salesChannel.id}>
                {salesChannel.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Item Number:
          <input type="text" name="itemNumber" onChange={handleFilterChange} />
        </label>
        <label>
          Item Title:
          <input type="text" name="itemTitle" onChange={handleFilterChange} />
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
      <table>
        <thead>
          <tr>
            <th>Item Number</th>
            <th>Item Title</th>
            <th>Price</th>
            <th>Date Listed</th>
            <th>Date Ended</th>
            <th>Date Sold</th>
          </tr>
        </thead>
        <tbody>
          {currentPageListings().map((listing) => (
            <tr key={listing.id}>
              <td>{listing.itemNumber}</td>
              <td>{listing.itemTitle}</td>
              <td>{listing.price}</td>
              <td>{listing.dateListed}</td>
              <td>{listing.dateEnded}</td>
              <td>{listing.dateSold}</td>
              <td><button>Inactive</button></td>
              <td><button>Fees</button></td>
            </tr> 
          ))}
        </tbody>
      </table>
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