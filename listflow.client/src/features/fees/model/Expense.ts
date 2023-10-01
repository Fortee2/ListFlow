import FeeTypes from "../enums/FeeTypes";

class Expense{
    public name: string;
    public rate: number;
    public rateType: FeeTypes;

    constructor(name: string, amount: number, rate: number, rateType: FeeTypes){
        this.name = name;
        this.rate = rate;
        this.rateType = rateType;
    }
}
export default Expense;