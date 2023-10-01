import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent/CardContent";
import Divider from "@mui/material/Divider";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {  setSellPrice, setShippingChrgd,  setShippingPaid , setPackingMaterials} from "../CalculatorSlice"
import NumericEntry from "./NumericEntry";

const SellingTarget = () => {

    const dispatch = useAppDispatch();
    const sellPrice = useAppSelector(state => state.calculator.sellPrice);
    const shippingChrgd = useAppSelector(state => state.calculator.shippingChrgd);
    const shippingPaid = useAppSelector(state => state.calculator.shippingPaid);
    const packingMaterials = useAppSelector(state => state.calculator.packingMaterials);

    return(
        <>
            <Card variant="outlined">
                <CardContent>
                    <Divider>Selling Target</Divider>   
                    <div className="row">
                        <div className="col-6">
                            <NumericEntry
                                label="Listing Price"
                                dataTestId={"selling-price"}
                                handleOnChange={(value)=>{
                                    dispatch(setSellPrice(value));
                                }}
                                value={sellPrice}
                            />
                        </div>
                        <div className="col-6">
                            <NumericEntry
                                dataTestId="shipping"
                                label="Shipping Charge"
                                handleOnChange={(value)=>{     
                                    dispatch(setShippingChrgd(value));        
                                }   
                                }
                                value={shippingChrgd}
                            />
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <NumericEntry
                                    label="Actual Postage"     
                                    handleOnChange={(value)=>{
                                        dispatch(setShippingPaid(value));
                                    }
                                    }
                                    value={shippingPaid}
                                />
                            </div>
                            <div className="col-6">
                                <NumericEntry
                                    label="Packing Cost"
                                    handleOnChange={(value)=>{
                                        dispatch(setPackingMaterials(value));
                                        }
                                    }
                                    value={packingMaterials}
                                />
                            </div>
                        </div>
                    </div>  
            </CardContent>
        </Card>
    </>
    )
}

export default SellingTarget;