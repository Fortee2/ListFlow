import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import descriptionReducer from '../features/engine/descriptionSlice';
import listingDescriptionReducer from '../features/engine/listingDescriptionSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    description: descriptionReducer,
    listingDescription: listingDescriptionReducer,
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
