import { useAppSelector, useAppDispatch } from '../../app/hooks';
import ListingDescriptionPrompt from './ListingDescriptionPrompt';
import {
    setDescription,
    setCondition,
    setConditionDetails,
    setIntlShipping,
    setItemLbs,
    setItemOz,
    selectDescription,
    selectCondition,
    selectConditionDetails,
    selectIntlShipping,
    selectItemLbs,
    selectItemOz,
} from './descriptionSlice';

import {
    selectListingDescription,
    requstDescription,
} from './listingDescriptionSlice';

import  './description.css';

const Description = () => {
    const dispatch = useAppDispatch();
    const desc = useAppSelector(selectDescription);
    const condition = useAppSelector(selectCondition);
    const conditionDetails = useAppSelector(selectConditionDetails);
    const intlShipping = useAppSelector(selectIntlShipping);
    const itemLbs = useAppSelector(selectItemLbs);
    const itemOz = useAppSelector(selectItemOz);
    const listingDescription = useAppSelector(selectListingDescription);

    const handleClick = (e: any) => {
        e.preventDefault();
        var requstBody:ListingDescriptionPrompt ={
            description: desc,
            condition: condition,
            conditionDesc: conditionDetails,
            listingType: "Buy It Now",
        };

        dispatch(requstDescription(requstBody));
    };

    return (
        

        <div className="description engineContent" >
            <h1>Description Engine</h1>
            
            <div>
                <div>
                    Item Details
                </div>
                <div className="row">
                    <div className="col-3">
                        <label>Describe Item</label>
                        
                    </div>
                    <div className="col-9">
                        <input type="text" name="item_name" value={desc} onChange={(data) => { dispatch(setDescription(data.target.value));}}  />
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Item Condtion</label>
                    </div>
                    <div className="col-6">
                        <select name="item_condition" value={condition} onChange={(ele) => {dispatch(setCondition(ele.target.selectedOptions[0].value));}} >
                            <option value="new">New</option>
                            <option value="used">Used</option>
                            <option value="refurbished">Refurbished</option>
                            <option value="for parts or not working">For Parts or Not Working</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Item Condition Details</label>
                    </div>
                    <div className="col-6">
                        <input type="text" name="item_condition_details" value={conditionDetails} onChange={(ele) => {dispatch(setConditionDetails(ele.target.value));}} />
                    </div>
                </div>
                <div className="row" >
                    <div className="col-6">
                        <label>International Shipping:</label>
                    </div>
                    <div className="col-6">
                        <select name="international_shipping" value={intlShipping} onChange={(ele) => {dispatch(setIntlShipping(ele.target.selectedOptions[0].value));}} >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <label>Item Weight</label>
                    </div>
                    <div className="col-3">
                        <input type="text" name="item_weight_lbs" value={itemLbs} onChange={(ele) => {
                                dispatch(setCondition(ele.target.value));
                            }
                        } />
                        <label className="ml-2">lbs</label>
                    </div>
                    <div className="col-3">
                        <input type="text" name="item_weight_ozs" value={itemOz} />
                        <label className="ml-2">oz</label>
                    </div>
                </div>
                <div className="row">
                    <button className="btn btn-primary">Create Description</button>
                </div>
                <div>Generated Listing</div>
                <div className="row">
                    <div className="col-12">
                        <textarea name="listing_description" id="" cols={80} rows={10} value={listingDescription}>

                        </textarea>
                    </div>
                </div>
                <div className="row">
                    <button className="btn btn-primary" onClick={handleClick}>Copy to Clipboard</button>
                </div>
            </div>
            
        
        </div>
    );
};

export default Description;