import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import descriptionReducer from '../features/engine/descriptionSlice';
import listingDescriptionReducer from '../features/engine/listingDescriptionSlice';
import listingReducer from '../features/listings/listingSlice';

export const store = configureStore({
  reducer: {
    description: descriptionReducer,
    listingDescription: listingDescriptionReducer,
    listing: listingReducer
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
