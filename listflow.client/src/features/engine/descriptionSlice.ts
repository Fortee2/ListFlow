import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';

export interface DescriptionState {
    listingType: string ;
    itemDescription: string;
    itemCondition: string;
    conditionDetails: string;
    intlShipping: string;
    freeShipping: string;
    itemLbs: number;
    itemOz: number;
}

const initialState: DescriptionState = {
    listingType: 'fixed',
    itemDescription: '',
    itemCondition: 'new',
    conditionDetails: '',
    intlShipping: 'no',
    freeShipping: 'no',
    itemLbs: 0,
    itemOz: 0,
};


export const descriptionSlice = createSlice({
    name: 'description',
    initialState,
    reducers: {
        setListingType: (state, action: PayloadAction<string>) => {
            state.listingType = action.payload;
        },
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
        setFreeShipping: (state, action: PayloadAction<string>) => {
            state.freeShipping = action.payload;
        },
        setItemLbs: (state, action: PayloadAction<number>) => {
            state.itemLbs = action.payload;
        },
        setItemOz: (state, action: PayloadAction<number>) => {
            state.itemOz = action.payload;
        },
    },
});

export const { setDescription, setCondition, setConditionDetails, setIntlShipping, setItemLbs, setItemOz, setListingType, setFreeShipping } = descriptionSlice.actions;

export const selectListingType = (state: RootState) => state.description.listingType;
export const selectDescription = (state: RootState) => state.description.itemDescription;
export const selectCondition = (state: RootState) => state.description.itemCondition;
export const selectConditionDetails = (state: RootState) => state.description.conditionDetails;
export const selectIntlShipping = (state: RootState) => state.description.intlShipping;
export const selectFreeShipping = (state: RootState) => state.description.freeShipping;
export const selectItemLbs = (state: RootState) => state.description.itemLbs;
export const selectItemOz = (state: RootState) => state.description.itemOz;

export default descriptionSlice.reducer;