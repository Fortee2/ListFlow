import { useAppSelector } from "../../store/hooks";
import { selectTotalFees as mercarTotalFees } from "../MercariFeeSlice";
import { selectTotalFees as ebayTotalFees } from "../EbayFeeSlice";
import { selectTotalCost  } from "../CalculatorSlice";
import { useEffect, useState } from "react";

export interface IProfitLossProps {
    marketPlace: string;
}

const ProfitLoss = (props : IProfitLossProps) => {
    const sellPrice = useAppSelector(state => state.calculator.sellPrice);
    const shippingChrgd = useAppSelector(state => state.calculator.shippingChrgd);
    const shippingPaid = useAppSelector(state => state.calculator.shippingPaid);
    const packingMaterials = useAppSelector(state => state.calculator.packingMaterials);
    const totalCost = useAppSelector (state => selectTotalCost(state))
    const mercariTotalFee = useAppSelector(state => mercarTotalFees(state));
    const ebayTotalFee = useAppSelector(state => ebayTotalFees(state));
    const [totalFees, setTotalFees] = useState(0);


    useEffect(() => {
        switch(props.marketPlace) {
            case "Mercari":
                setTotalFees( mercariTotalFee);
                break;
            case "eBay":
                setTotalFees (ebayTotalFee);
                break;
        }
    }, [sellPrice, shippingChrgd, shippingPaid, packingMaterials]);

    return(
        <>
            <div className="row">
                <div className="col-12">
                    <span>Total Fees</span>
                    <br></br>
                    <span>${totalFees.toPrecision(3)}</span>
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <span>Expected Profit</span>
                    <br></br>
                    <span>${(sellPrice + shippingChrgd - shippingPaid - packingMaterials - totalFees - totalCost).toPrecision(3)}</span>
                </div>
            </div>
        </>
    );
}

export default ProfitLoss;