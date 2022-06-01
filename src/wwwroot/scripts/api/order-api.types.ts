import {Base} from "./db-base";

export interface ValidateOrderPayload {
    products: Array<ProductValidationDto>
}

export interface Order extends Base {
    comment: string,
    paymentType: OrderPaymentType,
    status: OrderStatus,
    ContactInfo: ContactInformation,
    ProductIds: Array<string>
}

export interface SubmitOrderPayload extends Order {
}

export interface ContactInformation {
    name: string,
    phoneNumber: string,
    emailaddress: string
}

export interface ProductValidationDto {
    id: string,
    count: number
}

export enum OrderPaymentType {
    Vipps = 0,
    InvoiceByEmail = 1
}

export enum OrderStatus {
    InProgress = 0,
    Completed = 3,
    Canceled = 1,
    Failed = 2
}