import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import { fetchListingDescription } from './descriptionPromptAPI';

export interface DescriptionState {
    itemDescription: string;
    listingDesciption: string;
    itemCondition: string;
    conditionDetails: string;
    intlShipping: string;
    itemLbs: number;
    itemOz: number;
}

const initialState: DescriptionState = {
    itemDescription: '',
    listingDesciption: '',
    itemCondition: 'new',
    conditionDetails: '',
    intlShipping: 'no',
    itemLbs: 0,
    itemOz: 0,
};


export const descriptionSlice = createSlice({
    name: 'description',
    initialState,
    reducers: {
        setDescription: (state, action: PayloadAction<string>) => {
            state.itemDescription = action.payload;
        },
        setCondition: (state, action: PayloadAction<string>) => {
            state.itemCondition = action.payload;
        },
        setConditionDetails: (state, action: PayloadAction<string>) => {    
            state.conditionDetails = action.payload;
        },
        setIntlShipping: (state, action: PayloadAction<string>) => {
            state.intlShipping = action.payload;
        },
        setItemLbs: (state, action: PayloadAction<number>) => {
            state.itemLbs = action.payload;
        },
        setItemOz: (state, action: PayloadAction<number>) => {
            state.itemOz = action.payload;
        },
        setListingDescription: (state, action: PayloadAction<string>) => {
            state.listingDesciption = action.payload;
        }
    },
});

export const { setDescription, setCondition, setConditionDetails, setIntlShipping, setItemLbs, setItemOz } = descriptionSlice.actions;

export const selectDescription = (state: RootState) => state.description.itemDescription;
export const selectCondition = (state: RootState) => state.description.itemCondition;
export const selectConditionDetails = (state: RootState) => state.description.conditionDetails;
export const selectIntlShipping = (state: RootState) => state.description.intlShipping;
export const selectItemLbs = (state: RootState) => state.description.itemLbs;
export const selectItemOz = (state: RootState) => state.description.itemOz;

export default descriptionSlice.reducer;