import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../app/store';
import { SalesChannel } from './SalesChannel';

interface SalesChannelState {
  salesChannels: SalesChannel[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const fetchSalesChannels = createAsyncThunk('salesChannels/fetchSalesChannels', async () => {
  const response = await axios.get('https://localhost:7219/api/saleschannel');
  return response.data.data;
});

const initialState: SalesChannelState = {
  salesChannels: [],
  status: 'idle',
  error: null,
};

export const salesChannelSlice = createSlice({
  name: 'salesChannels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesChannels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSalesChannels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.salesChannels = action.payload;
      })
      .addCase(fetchSalesChannels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export const getSalesChannels = (state: RootState) => state.salesChannels.salesChannels;

export default salesChannelSlice.reducer;