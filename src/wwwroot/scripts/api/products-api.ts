import {CreateProductPayload, Product} from "./products-api.types";

export function createProduct(payload: CreateProductPayload): Promise<Response> {
    return fetch("/api/products/create", {
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(payload),
        method: "post",
        credentials: "include"
    });
}

export function getProduct(id: string): Promise<Response> {
    return fetch("/api/products/" + id, {
        method: "get",
        credentials: "include"
    });
}

export function getProducts(): Promise<Response> {
    return fetch("/api/products", {
        method: "get",
        credentials: "include"
    });
}

export function uploadProductImages(files: Array<File>): Promise<Response> {
    if (files.length <= 0) throw new Error("files.length was " + files.length);
    const data = new FormData();
    for (const file of files)
        data.append("files", file);

    return fetch("/api/products/upload-images", {
        method: "post",
        body: data
    });
}

export function deleteProduct(id: string): Promise<Response> {
    return fetch("/api/products/" + id + "/delete", {
        method: "delete",
        credentials: "include"
    });
}

export function updateProduct(data: Product): Promise<Response> {
    if (!data.id) {
        throw new Error("data.id was undefined");
    }
    return fetch("/api/products/" + data.id + "/update", {
        method: "post",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data),
        credentials: "include"
    });
}