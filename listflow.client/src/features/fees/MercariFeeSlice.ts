import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import FeeTypes from "../enums/FeeTypes";
import Expense from "../model/Expense";
import Fee from "../model/Fee";
import { RootState } from "../store/store";

export interface iMercariFeeState{
    baseFee: Expense;
    paymentFeePercent: Expense;
    paymentFeeFixed: Expense;
    fees: Fee[];
}

const initState: iMercariFeeState = {
    baseFee: new Expense("Final Value Fee", 0, 10, FeeTypes.PERCENTAGE),
    paymentFeePercent: new Expense("Payment Fee 1", 0, 2.9, FeeTypes.PERCENTAGE),
    paymentFeeFixed: new Expense("Payment Fee 2", 0, 0.5, FeeTypes.FIXED),
    fees: [],
}

export const MercariFeeSlice = createSlice({
    name: "mercariFees",
    initialState: initState,
    reducers: {
        setBaseFee: (state, action: PayloadAction<Expense>) => {
            state.baseFee = action.payload;
        },
        setPaymentFeePercent: (state, action: PayloadAction<Expense>) => {
            state.paymentFeePercent = action.payload;
        },
        setPaymentFeeFixed: (state, action: PayloadAction<Expense>) => {
            state.paymentFeeFixed = action.payload;
        },
        addFee: (state, action: PayloadAction<Fee>) => {
            state.fees.push(action.payload);
        },
        removeFee: (state, action: PayloadAction<Fee>) => {
            state.fees = state.fees.filter(fee => fee.name !== action.payload.name);
        }
    }   
});

export const selectSpecificFeeAmount = (state: RootState, name: string) => {
    const singleFee  = state.mercariFees.fees.find(fee => fee.name === name);

    if(singleFee){
        return singleFee.amount;
    }

    return 0;
}

export const selectTotalFees = (state: RootState) => {
    let total = 0;
    state.mercariFees.fees.forEach(fee => {
        total += fee.amount;
    });
    return total;
}

export const { setPaymentFeePercent, setPaymentFeeFixed, setBaseFee, addFee, removeFee } = MercariFeeSlice.actions;

export default MercariFeeSlice.reducer;