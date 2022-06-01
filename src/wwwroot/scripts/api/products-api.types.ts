import {Base} from "./db-base";
import {Category} from "./categories-api.types";

export interface Product extends Base {
    name: string,
    description: string,
    price: number,
    priceSuffix: PriceSuffix,
    visibilityState: ProductVisibility,
    category: Category,
    images: Array<Image>,
    slug: string,
    disabled: boolean,
    deleted: boolean
}

export interface CreateProductPayload extends Product {
}

export interface Image {
    order: number,
    fileName: string
}

export enum PriceSuffix {
    Money = 0,
    Kilos = 1,
    Per = 2
}

export enum ProductVisibility {
    Default = 0,
    Disabled = 1,
    Deleted = 2
}