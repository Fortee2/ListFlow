// listingSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './listingAPI';
import {Listing } from './listing'
import { RootState } from '../../app/store';
import { stat } from 'fs';

export const getAllListings = createAsyncThunk('listings/getAll', async () => {
  const response = await api.getAllListings();
  return response;
});

export const getListingById = createAsyncThunk('listings/getOne', async (id: string) => {
  const response = await api.getListingById(id);
  return response;
});

export const createListing = createAsyncThunk('listings/create', async (listingDTO: Listing) => {
  const response = await api.createListing(listingDTO);
  return response;
});

export const updateListing = createAsyncThunk('listings/update', async (updatedListing: Listing) => {
  const response = await api.updateListing(updatedListing);
  return response;
});

export const deleteListing = createAsyncThunk('listings/delete', async (id: string) => {
  await api.deleteListing(id);
  return id;
});

export interface ListingState {
  status: string;
  allListings: Listing[];
  selectedListing: Listing | undefined;
  error: string | undefined;
}

const initialState: ListingState = {
  allListings: [],
  selectedListing: undefined,
  status: 'idle',
  error: undefined,
};

const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setSelectedListingById: (state, action) => {
      const id = action.payload;
      state.selectedListing = state.allListings.find((listing) => listing.id === id);
    },
    clearSelectedListing: (state) => {
      state.selectedListing = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAllListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
        state.allListings = action.payload;
      })
      .addCase(getAllListings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(getListingById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getListingById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedListing = action.payload;
      })
      .addCase(getListingById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allListings.push(action.payload);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedListingIndex = state.allListings.findIndex(
          (listing) => listing.id === action.payload.id
        );
        state.allListings[updatedListingIndex] = action.payload;
        state.selectedListing = action.payload;
      })
      .addCase(updateListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteListing.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allListings = state.allListings.filter((listing) => listing.id !== action.payload);
        state.selectedListing = undefined;
      })
      .addCase(deleteListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setSelectedListingById, clearSelectedListing} = listingSlice.actions;

export const getListings = (state:RootState) =>  state.listing.allListings;
export const getSelectedListing = (state:RootState) => state.listing.selectedListing;

export default listingSlice.reducer;
