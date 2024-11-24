import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL is not defined');
}

const API_URL = process.env.REACT_APP_API_URL;

interface Filter {
  salesChannel?: string;
  itemNumber?: string;
  startDate?: string;
  endDate?: string;
}

interface ListingState {
  listings: any[];
  selectedListing: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ListingState = {
  listings: [],
  selectedListing: null,
  status: 'idle',
  error: null,
};

export const fetchListingsByFilter = createAsyncThunk('listings/fetchListingsByFilter', async (filter: Filter) => {
  const response = await axios.get(`${API_URL}/listing`, { params: filter });
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

export const getListings = (state: any) => state.listings.listings;
export const getSelectedListing = (state: any) => state.listings.selectedListing;
export const getStatus = (state: any) => state.listings.status;
export const getError = (state: any) => state.listings.error;

export default listingSlice.reducer;
