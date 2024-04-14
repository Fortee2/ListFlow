import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { Listing } from './listing';

interface ListingState {
  listings: Listing[];
  selectedListing: Listing | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface Filter {
  salesChannel?: string;
  itemNumber?: string;
  startDate?: string;
  endDate?: string;
}

const initialState: ListingState = {
  listings: [],
  selectedListing: null,
  status: 'idle',
  error: null,
};

export const fetchListingsByFilter = createAsyncThunk('listings/fetchListingsByFilter', async (filter: Filter) => {
  const response = await axios.get('http://localhost:5227/api/listing', { params: filter });
  return response.data;
});

export const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setSelectedListing: (state, action) => {
      state.selectedListing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListingsByFilter.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchListingsByFilter.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.listings = action.payload;
      })
      .addCase(fetchListingsByFilter.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export const { setSelectedListing } = listingSlice.actions;

export const getListings = (state: RootState) => state.listings.listings;
export const getSelectedListing = (state: RootState) => state.listings.selectedListing;
export const getStatus = (state: RootState) => state.listings.status;
export const getError = (state: RootState) => state.listings.error;

export default listingSlice.reducer;