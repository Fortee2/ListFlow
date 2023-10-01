import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import FeeTypes from "../../enums/FeeTypes";
import Expense from "./model/Expense";
import Fee from "./model/Fee";
import { RootState } from "../../app/store";

export interface iEbayFeeState{
    baseFee: Expense;
    finalValueFee: Expense;
    belowStdFee: Expense;
    fees: Fee[];
}

const initState: iEbayFeeState = {
    baseFee: new Expense("Base Fee", 0, 0.3, FeeTypes.FIXED),
    finalValueFee: new Expense("Final Value Fee", 0, 12.9, FeeTypes.PERCENTAGE),
    belowStdFee: new Expense("Below Standard Fee", 0, 6, FeeTypes.PERCENTAGE),
    fees: [{name: "Base Fee", amount: 0.3}],
}

export const eBayFeeSlice = createSlice({
    name: "eBayFees",
    initialState: initState,
    reducers: {
        setBaseFee: (state, action: PayloadAction<Expense>) => {
            state.baseFee = action.payload;
        },
        setFinalValueFee: (state, action: PayloadAction<Expense>) => {
            state.finalValueFee = action.payload;
        },
        setBelowStdFee: (state, action: PayloadAction<Expense>) => {
            state.belowStdFee = action.payload;
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
    const singleFee  = state.eBayFees.fees.find(fee => fee.name === name);

    if(singleFee){
        return singleFee.amount;
    }

    return 0;
}

export const selectTotalFees = (state: RootState) => {
    let total = 0;
    state.eBayFees.fees.forEach(fee => {
        total += fee.amount;
    });
    return total;
}

export const { setBaseFee, setFinalValueFee, setBelowStdFee, addFee, removeFee } = eBayFeeSlice.actions;

export default eBayFeeSlice.reducer;