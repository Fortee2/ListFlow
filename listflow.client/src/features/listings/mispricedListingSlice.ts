import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { MispricedListing } from './mispricedListing';

// Define the type for the slice state
interface MispricedListingState {
  listings: MispricedListing[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: MispricedListingState = {
  listings: [],
  status: 'idle',
  error: null,
};

// Define the async thunk for fetching mispriced listings
export const fetchMispricedListings = createAsyncThunk('listings/fetchMispricedListings', async () => {
  const response = await axios.get<MispricedListing[]>('http://localhost:5227/api/Listing/mispriced');
  return response.data;
});

// Define the slice
const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(fetchMispricedListings.pending, (state: MispricedListingState) => {
      state.status = 'loading';
    })
    .addCase(fetchMispricedListings.fulfilled, (state: MispricedListingState, action) => {
      state.status = 'succeeded';
      // Add the listings to the state array
      state.listings = action.payload;
    })
    .addCase(fetchMispricedListings.rejected, (state: MispricedListingState, action) => {
      state.status = 'failed';
      state.error = action.error.message ?? null;
    });
  },
});

export default listingSlice.reducer;