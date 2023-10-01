import FeeTypes from "../../enums/FeeTypes";

class ItemCalculator {
    price: number;
    tax: number;
    taxType: FeeTypes;
    calculatedTax: number;
    estimatedPostage: number;
    estimatedPackingMaterials: number;
    totalItemCost: number ;


    constructor(price: number, tax: number, taxType: FeeTypes, estimatedPostage: number, estimatedPackingMaterials: number){
        this.price = price; 
        this.tax = tax;
        this.taxType = taxType;
        this.calculatedTax = 0;
        this.estimatedPostage = estimatedPostage;
        this.estimatedPackingMaterials = estimatedPackingMaterials;
        this.totalItemCost = 0;

        this.calculateTaxAmount();
        this.calculateTotalItemCost();
    }
    
     protected calculateTaxAmount = (): number => {

        if(this.tax <= 0) return 0;

        this.calculatedTax = (this.taxType == FeeTypes.PERCENTAGE) ? (this.tax /100)  * this.price : this.tax;
        return this.calculatedTax;
    }

    protected calculateTotalItemCost = (): number => {
        this.totalItemCost = this.price + this.calculatedTax + this.estimatedPostage + this.estimatedPackingMaterials;
        return this.totalItemCost;
    }
}

export default ItemCalculator;