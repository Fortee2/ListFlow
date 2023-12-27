import { Card, CardContent, Divider } from "@mui/material";
import { useEffect} from "react";
import ItemCalculator from "../ItemCalculator";
import FeeTypes from "../../../enums/FeeTypes";
import { PrecentageInput } from "./PrecentageInput";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import {setPricePaid, setTaxPaid,setTaxRate, setTaxRateType } from "../CalculatorSlice"
import NumericEntry from "./NumericEntry";

const ItemCost = () => {
    const itemPrice = useAppSelector(state => state.calculator.pricePaid);
    const totalTax = useAppSelector(state => state.calculator.taxPaid);
    const salesTaxRate = useAppSelector(state => state.calculator.taxRate);
    const salesTaxRateType = useAppSelector(state => state.calculator.taxRateType);

    const dispatch = useAppDispatch();

    const setCalculatedAmount = (itemPrice : number, salesTax :number, salesTaxType: FeeTypes ) => {
        const Item = new ItemCalculator( itemPrice, salesTax, salesTaxType, 0, 0 );
        dispatch(setTaxPaid(Item.calculatedTax));
    }

    useEffect(() => {
        setCalculatedAmount(itemPrice, salesTaxRate, salesTaxRateType);
        
    },[itemPrice, salesTaxRate, salesTaxRateType]);


    return (
        <>
            <Card variant="outlined">
                <CardContent>
                    <Divider>
                        Item Cost
                    </Divider>
                    <div className="row">
                        <div className="col-12">
                            <NumericEntry
                                label="Item Cost"
                                dataTestId={"item-cost-input"}
                                handleOnChange={(value)=>{
                                    dispatch(setPricePaid(value));
                                }}
                                value={0}
                            />

                        </div>
                    </div>   
                    <div className="row"  >
                        <div className="col-12 center">
                                <PrecentageInput
                                    label="Sales Tax"
                                    dataTestId={"sales-input"}
                                    amtType={salesTaxRateType}
                                    value={salesTaxRate}
                                    handleOnChange={(value, amtType)=>{ 
                                    
                                        dispatch(setTaxRate(value));
                                        dispatch(setTaxRateType(amtType));
                                    }}
                                />
                            </div>
                       
                    </div>
                    <div className="row"> 
                        <div className="col-6">
                            <span>Tax Amount</span>
                            <br></br>
                            <span  data-testid='spTotalTax'>${parseFloat(totalTax.toFixed(3))}</span>
                        </div>
                        <div className="col-6">
                            <span>Total Cost</span>
                            <br></br>
                            <span data-testid='spTotalCost'>${totalTax + itemPrice}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            
        </>
    );
}   

export default ItemCost;