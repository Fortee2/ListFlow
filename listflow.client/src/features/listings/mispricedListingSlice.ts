import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { MispricedListing } from './mispricedListing';

if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL is not defined');
}

const API_URL = `${process.env.REACT_APP_API_URL}/Listing/mispriced`;

export const fetchMispricedListings = createAsyncThunk('mispricedListings/fetchMispricedListings', async () => {
  const response = await axios.get<MispricedListing[]>(API_URL);
  return response.data;
});

const initialState = {
  mispricedListings: [] as MispricedListing[],
  status: 'idle',
  error: null as string | null,
};

const mispricedListingSlice = createSlice({
  name: 'mispricedListings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMispricedListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMispricedListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.mispricedListings = action.payload;
      })
      .addCase(fetchMispricedListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export const getMispricedListings = (state: any) => state.mispricedListings.mispricedListings;
export const getStatus = (state: any) => state.mispricedListings.status;
export const getError = (state: any) => state.mispricedListings.error;

export default mispricedListingSlice.reducer;
