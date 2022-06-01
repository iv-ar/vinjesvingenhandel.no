import {Base} from "./db-base";
import {Product} from "./products-api.types";

export interface Category extends Base {
    name: string,
    slug: string,
    visibilityState: CategoryVisibility,
    disabled: boolean,
    deleted: boolean,
    products: Array<Product>
}

export enum CategoryVisibility {
    Default = 0,
    Disabled = 1,
    Deleted = 2
}