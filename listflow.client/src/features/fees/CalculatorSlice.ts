import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import FeeTypes from "../../enums/FeeTypes";

import { RootState } from "../../app/store";

export interface iCalculatorState {
    pricePaid: number;
    taxPaid: number;
    taxRate: number;
    taxRateType: FeeTypes;
    sellPrice: number;
    shippingChrgd: number;
    shippingPaid: number;
    packingMaterials: number;
    totalSellPrice: number;
}

const initState: iCalculatorState = {
    pricePaid: 0,
    taxPaid: 0,
    taxRate: 0,
    taxRateType: FeeTypes.PERCENTAGE,
    sellPrice: 0,
    shippingChrgd: 0,
    shippingPaid: 0,
    packingMaterials: 0,
    totalSellPrice: 0,
};

export const calculatorSlice = createSlice({
    name: "calculator",
    initialState: initState,
    reducers: {
        setPricePaid: (state, action: PayloadAction<number>) => {
            state.pricePaid = action.payload;
        },
        setTaxPaid: (state, action: PayloadAction<number>) => {
            state.taxPaid = action.payload;
        },
        setTaxRate: (state, action: PayloadAction<number>) => {
            state.taxRate = action.payload;
        },
        setTaxRateType: (state, action: PayloadAction<FeeTypes>) => {
            state.taxRateType = action.payload;
        },
        setSellPrice: (state, action: PayloadAction<number>) => {
            state.sellPrice = action.payload;
            state.totalSellPrice = action.payload + state.shippingChrgd;
        },
        setShippingChrgd: (state, action: PayloadAction<number>) => {
            state.shippingChrgd = action.payload;
            state.totalSellPrice = action.payload + state.sellPrice;
        },
        setShippingPaid: (state, action: PayloadAction<number>) => {
            state.shippingPaid = action.payload;
        },
        setPackingMaterials: (state, action: PayloadAction<number>) => {
            state.packingMaterials = action.payload;
        }
    }
} );

export const { setPricePaid, setTaxPaid, setSellPrice, setShippingChrgd, setShippingPaid, setTaxRate, setTaxRateType, setPackingMaterials } = calculatorSlice.actions;

export const selectTotalCost = (state: RootState) => {
    return state.calculator.pricePaid + state.calculator.taxPaid;
}

export const selectPricePaid = (state: RootState) => state.calculator.pricePaid;
//Amount of tax paid when buying the item
export const selectTaxPaid = (state: RootState) => state.calculator.taxPaid; 
//Sales Tax rate to calculate tax paid
export const selectTaxRate = (state: RootState) => state.calculator.taxRate;
//Whether Tax paid was a fixed dollar amount or a percentage
export const selectTaxRateType = (state: RootState) => state.calculator.taxRateType;
export const selectSellPrice = (state: RootState) => state.calculator.sellPrice;
//The amount charged for shipping
export const selectShippingChrgd = (state: RootState) => state.calculator.shippingChrgd;
//The amount it cost to ship the item
export const selectShippingPaid = (state: RootState) => state.calculator.shippingPaid;
//export const selectSellingFees = (state: RootState) => state.calculator.sellingFees;

export const selectTotalSellingPrice = (state: RootState) => {
    return state.calculator.sellPrice + state.calculator.shippingChrgd ;
}

export default calculatorSlice.reducer;