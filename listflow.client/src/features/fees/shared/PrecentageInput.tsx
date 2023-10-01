import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import { useEffect, useState } from "react";
import FeeTypes from "../../enums/FeeTypes";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import NumericEntry from './NumericEntry';

interface PrecentageInputProps {
    label: string;
    value: number;
    amtType: FeeTypes;
    dataTestId?: string;
    handleOnChange: (newValue : number, valueType :  number)    => void;   
}

export const PrecentageInput = (props: PrecentageInputProps) => {
    const [controlValue, setControlValue] = useState<number>(props.value);
    const [amtType, setAmtType] = useState<number>(props.amtType);

    const calculateNewValue = () => {
        const newValue: number = isNaN( controlValue) ? 0 : controlValue;
        props.handleOnChange(newValue,amtType);
    }

    const onHandleClick = (
            event: React.MouseEvent<HTMLElement>,
            newAlignment: FeeTypes,
        ) => {
            setAmtType(newAlignment);
        }

    useEffect(() => {
        calculateNewValue();
    } , [controlValue, amtType]);

    return (
        <>
            <div className="float-left width-30" >
                <NumericEntry
                    dataTestId={ (props.dataTestId === null) ? '' : props.dataTestId }
                    label={props.label}
                    handleOnChange={(value)=>{
                        setControlValue(value);
                        calculateNewValue();
                    } }
                    value={controlValue}
                />
            </div>
            <div className="float-left">
                <ToggleButtonGroup
                    value={amtType}
                    exclusive
                    onChange={onHandleClick}
                    aria-label="precentage-toggle-button"
                >
                    <ToggleButton value={FeeTypes.PERCENTAGE} aria-label="percentage">
                        <PercentIcon />
                    </ToggleButton>
                    <ToggleButton value={FeeTypes.FIXED} aria-label="fixed">
                        <AttachMoneyIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
        </>
    );
}