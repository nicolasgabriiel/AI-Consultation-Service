import { MeasureType } from './enums/MeasureType';

export class Measurement {
    id?: number;
    image: string;
    customerCode: string;
    measureDatetime: Date;
    measureType: MeasureType;

    constructor(
        image: string,
        customerCode: string,
        measureDatetime: Date,
        measureType: MeasureType
    ) {
        this.image = image;
        this.customerCode = customerCode;
        this.measureDatetime = measureDatetime;
        this.measureType = measureType;
    }
}