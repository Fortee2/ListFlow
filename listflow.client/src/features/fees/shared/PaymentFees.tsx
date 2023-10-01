import { useEffect } from "react";
import FeeTypes from "../../enums/FeeTypes";
import { removeFee, addFee,selectSpecificFeeAmount } from "../MercariFeeSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const PaymentFees = () => {
    const dispatch = useAppDispatch();
    const sellPrice = useAppSelector(state => state.calculator.totalSellPrice);
    const paymentFeePercent = useAppSelector(state => state.mercariFees.paymentFeePercent);
    const paymentFeeFlat = useAppSelector(state => state.mercariFees.paymentFeeFixed);
    const paymentFeeAmount = useAppSelector(state => selectSpecificFeeAmount(state, "Mercari Payment Fee"));

    useEffect(() => {
        let payFee1 = 0;
        let payFee2 = 0;

        if(sellPrice > 0) {
            payFee1 = (paymentFeePercent.rateType === FeeTypes.PERCENTAGE) ? (sellPrice * (paymentFeePercent.rate / 100)) : paymentFeePercent.rate;
            payFee2 = (paymentFeePercent.rateType === FeeTypes.PERCENTAGE) ? (sellPrice * (paymentFeePercent.rate / 100)) : paymentFeePercent.rate;
            dispatch(removeFee({name:"Mercari Payment Fee", amount: 0}));
            dispatch(addFee({name:"Mercari Payment Fee", amount: payFee1 + payFee2}));
        }
    }, [sellPrice]);

    return (
        <div className="row">
            <div className="col-9">
                <span>Payment Processing Fee: {paymentFeePercent.rate}% + {paymentFeeFlat.rate}</span>
            </div>
            <div className="col-3">
                <span>${paymentFeeAmount.toPrecision(3)}</span>
            </div>
        </div>
    )
}

export default PaymentFees;