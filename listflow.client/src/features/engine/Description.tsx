import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import ListingDescriptionPrompt from './ListingDescriptionPrompt';
import {
    setDescription,
    setCondition,
    setConditionDetails,
    setIntlShipping,
    setFreeShipping,
   // setItemLbs,
   // setItemOz,
    selectDescription,
    selectCondition,
    selectConditionDetails,
    selectIntlShipping,
    selectFreeShipping,
    selectListingType,
    setListingType
} from './descriptionSlice';

import {
    selectListingDescription,
    requstDescription,
    setListingDescription
} from './listingDescriptionSlice';

import  './description.css';

const Description = () => {
    const dispatch = useAppDispatch();
    const desc = useAppSelector(selectDescription);
    const condition = useAppSelector(selectCondition);
    const conditionDetails = useAppSelector(selectConditionDetails);
    const intlShipping = useAppSelector(selectIntlShipping);
    const freeShipping = useAppSelector(selectFreeShipping);
    const listingDescription = useAppSelector(selectListingDescription);
    const listingType = useAppSelector(selectListingType);

    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState({
        desc: "",
        condition: "",
        conditionDetails: "",
      });

    const handleReset = (e: any) => {
        e.preventDefault();
        dispatch(setDescription(""));
        dispatch(setCondition("new"));
        dispatch(setConditionDetails(""));
        dispatch(setIntlShipping("no"));
        dispatch(setListingType("fixed"));
        dispatch(setListingDescription(""));
    }

     const handleClick = async (e: any) => {
        e.preventDefault();
        let requstBody:ListingDescriptionPrompt ={
            description: desc,
            condition: condition,
            conditionDesc: conditionDetails,
            listingType: listingType,
            intlShipping: intlShipping,
            freeShipping: freeShipping
        };

        if (desc === "") {
            setErrors({ ...errors, desc: "Description is required" });
            return;
        }

        if (condition !== "new" && conditionDetails === "" ) {
            setErrors({ ...errors, condition: "Condition Details is required" });
            return;
        }

        try {
            setIsLoading(true);
            await dispatch(requstDescription(requstBody)).unwrap();
            setIsLoading(false);
          } catch (err) {
            setIsLoading(false);
            console.error("Error creating description: ", err);
            // Handle error and display user feedback if necessary
          }
    };

    const handleCopy = (e: any) => {
        e.preventDefault();
        let copyText:HTMLInputElement = document.getElementById("listingDescription") as HTMLInputElement;
        if(copyText == null) return;
        navigator.clipboard.writeText(copyText.value)
        .then(() => {
          console.log("Text copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }

    return (
        <div className="description engineContent" >
            <h1>Description Engine</h1>
            
            <div>
                <div className="row">
                    <div className="col-3">
                        <label>Listing Platform</label>
                    </div>
                    <div className="col-9">
                       <label><input type='radio' name='listingPlatform' value="ebay"/>Ebay</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3">
                        <label>List Type</label>
                    </div>
                    <div className="col-9">
                        <select name="listing_type" value={listingType} onChange={(data) => { dispatch(setListingType(data.target.value));}}>
                            <option value="auction">Auction</option>
                            <option value="fixed">Fixed Price</option>
                        </select>
                    </div>
                </div>
                <div>
                    <h3>Item Details</h3>
                    <hr />
                </div>
                <div className="row">
                    <div className="col-3">
                        <label>Describe Item</label>
                        
                    </div>
                    <div className="col-9">
                        <input type="text" name="item_name" value={desc} onChange={(data) => { dispatch(setDescription(data.target.value));}}  />
                        <label className="error">{errors.desc}</label>
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
                        <label className="error">{errors.conditionDetails}</label>
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
                <div className="row" >
                    <div className="col-6">
                        <label>Free Shipping:</label>
                    </div>
                    <div className="col-6">
                        <select name="free_shipping" value={freeShipping} onChange={(ele) => {dispatch(setFreeShipping(ele.target.selectedOptions[0].value));}} >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <button className="btn btn-primary" disabled={isLoading} onClick={handleClick}>Create Description</button>
                    <button className="btn btn-secondary" disabled={isLoading} onClick={handleReset}>Reset</button>
                </div>
                <div>
                    <h3>Generated Listing</h3>
                    <hr />
                </div>
                <div className="row">
                    <div className="col-12">
                        <textarea id="listing_description" cols={80} rows={10} value={listingDescription}></textarea>
                    </div>
                </div>
                <div className="row">
                    <button className="btn btn-primary" onClick={handleCopy} disabled={isLoading} >Copy to Clipboard</button>
                </div>
            </div>
        </div>
    );
};

export default Description;