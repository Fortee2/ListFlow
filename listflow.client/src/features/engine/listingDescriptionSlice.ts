import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import { fetchListingDescription } from './descriptionPromptAPI';
import ListingDescriptionPrompt  from './ListingDescriptionPrompt';

export interface ListingDescriptionState {
    listingDesciption: string;
    status: 'idle' | 'loading' | 'failed';
}

const initialState: ListingDescriptionState = {
    listingDesciption: '',
    status: 'idle',
};

export const requstDescription = createAsyncThunk(
    'listingdescription/fetchListingDescription',
    async (requestBody: ListingDescriptionPrompt) => {
        const response = await fetchListingDescription(requestBody);
        // The value we return becomes the `fulfilled` action payload
        return response;
    }
  );

export const listingDescriptionSlice = createSlice({
    name: 'listingDescription',
    initialState,
    reducers: {
        setListingDescription: (state, action: PayloadAction<string>) => {
            state.listingDesciption = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(requstDescription.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(requstDescription.fulfilled, (state, action) => {
                state.status = 'idle';
                state.listingDesciption = action.payload;
            })
            .addCase(requstDescription.rejected, (state) => {
                state.status = 'failed';
            });
    }
});

export const { setListingDescription} = listingDescriptionSlice.actions;

export const selectListingDescription = (state: RootState) => state.listingDescription.listingDesciption;

export default listingDescriptionSlice.reducer;