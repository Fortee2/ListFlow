import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import descriptionReducer from '../features/engine/descriptionSlice';
import listingDescriptionReducer from '../features/engine/listingDescriptionSlice';
import listingReducer from '../features/listings/listingSlice';
import salesChannelReducer from '../features/saleschannel/salesChannelSlice';
import calculatorReducer from '../features/fees/CalculatorSlice';
import eBayFeeReducer from '../features/fees/EbayFeeSlice';

export const store = configureStore({
  reducer: {
    description: descriptionReducer,
    listingDescription: listingDescriptionReducer,
    listings: listingReducer,
    salesChannels: salesChannelReducer,
    calculator: calculatorReducer,
    eBayFees: eBayFeeReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
