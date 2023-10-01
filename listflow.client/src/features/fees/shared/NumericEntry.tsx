import TextField from "@mui/material/TextField";
import { useEffect, useState} from "react";


interface NumericEntryProps {
    label: string;
    value: number;
    dataTestId?: string;
    handleOnChange: (newValue : number)    => void;   
}

const NumericEntry= (prop : NumericEntryProps) =>{

    const [value, setValue] = useState(String);

    useEffect(() => {
        setValue(prop.value.toString());
    } , []);

    return (
        <TextField
            label={prop.label}
            inputProps={{ 'data-testid': prop.dataTestId }}
            value={value}
            onChange={
                (e) => {
                    setValue(e.target.value);
                    if( !isNaN(parseFloat(e.target.value))){
                        prop.handleOnChange(parseFloat(e.target.value));
                    }
                }
            }
            type="number"
        />
    )
}

export default NumericEntry;