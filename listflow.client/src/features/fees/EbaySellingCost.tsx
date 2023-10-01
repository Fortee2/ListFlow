import { Card, CardContent, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import FeeTypes from "../../enums/FeeTypes";
import { selectSpecificFeeAmount, removeFee, addFee } from "./EbayFeeSlice";
import { PrecentageInput } from "./shared/PrecentageInput";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import ProfitLoss from "./shared/ProfitLoss";

//import {setBelowStdFee, setFinalValueFee} from "../../Slices/EbayFeeSlice";

const EbaySellingCost = () => {
    const dispatch = useAppDispatch();
    const sellPrice = useAppSelector(state => state.calculator.totalSellPrice);
    const shippingPaid = useAppSelector(state => state.calculator.shippingPaid );
    const belowStdFee = useAppSelector(state => state.eBayFees.belowStdFee);

    const finalValueFee = useAppSelector(state => state.eBayFees.finalValueFee);
    const finalValueAmount = useAppSelector(state => selectSpecificFeeAmount(state, "Final Value Fee"));
    const belowStdAmount = useAppSelector(state => selectSpecificFeeAmount(state, "Below Standard Fee"));

    const [salesTax, setSalesTax] = useState<number>(8);
    const [salesTaxType , setSalesTaxType] = useState<FeeTypes>(FeeTypes.PERCENTAGE);
    const [totalTax, setTotalTax] = useState<number>(0);


    useEffect(() => {
        setTotalTax((salesTaxType === FeeTypes.PERCENTAGE) ? (sellPrice * (salesTax /100)) : salesTax);
    }, [salesTax, salesTaxType, sellPrice]);

    useEffect(() => {
        let fvFee = 0;

        if(sellPrice > 0) {
            fvFee = (finalValueFee.rateType === FeeTypes.PERCENTAGE) ? (sellPrice * (finalValueFee.rate / 100)) : finalValueFee.rate;
            dispatch(removeFee({name:"Final Value Fee", amount: fvFee}));
            dispatch(addFee({name:"Final Value Fee", amount: fvFee}));
        }
    }, [sellPrice, shippingPaid, belowStdFee, finalValueFee, salesTax, salesTaxType, totalTax]);

    useEffect(() => {
        let fvFee = 0;

        if(sellPrice > 0) {
            fvFee = (belowStdFee.rateType === FeeTypes.PERCENTAGE) ? (sellPrice * (belowStdFee.rate / 100)) : belowStdFee.rate;
            dispatch(removeFee({name:"Below Standard Fee", amount: fvFee}));
            dispatch(addFee({name:"Below Standard Fee", amount: fvFee}));
        }
    }, [sellPrice, shippingPaid, finalValueFee,  finalValueFee, salesTax, salesTaxType, totalTax]);

    return (
        <>

            <Card variant="outlined">
                <CardContent>
                    <Divider>Ebay Selling Costs</Divider>
                        <div className="row">
                            <div className="col-9">
                            <PrecentageInput
                                label="Estimated Tax Chrg'd"
                                amtType={salesTaxType}
                        
                                value={salesTax}
                                handleOnChange={(value, amtType)=>{
                                        setSalesTax(value);
                                        setSalesTaxType(amtType);
                                    }
                                }
                            />
                        </div>
                        <div className="col-3">
                            <span>Total + Tax ${(totalTax + sellPrice).toPrecision(3)}</span>
                            <br/>
                            <span>Tax Amt:${totalTax.toPrecision(3)}</span>
                        </div>
                    </div>
                    <div className="row" >
                        <div className="col-9">
                            <span>Final Value Fee: {finalValueFee.rate}%</span>
                        </div>
                        <div className="col-3">
                            <span>${finalValueAmount.toPrecision(3)}</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-9">
                            <span>Below Standard Fee: {belowStdFee.rate}%</span>
                        </div>
                        <div className="col-3">
                            <span>${belowStdAmount.toPrecision(3)}</span>
                        </div>
                    </div>
                    <ProfitLoss marketPlace="eBay" />
                </CardContent>
            </Card>


        </>
    )
}

export default EbaySellingCost;
