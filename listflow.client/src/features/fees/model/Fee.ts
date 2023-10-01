export default class Fee {
    name: string;
    amount: number;

    constructor(
        name: string,
        amount: number,
    ) { 
        this.name = name;
        this.amount = amount;
    }
}