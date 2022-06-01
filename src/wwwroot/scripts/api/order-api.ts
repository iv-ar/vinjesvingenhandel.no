import {SubmitOrderPayload, ValidateOrderPayload} from "./order-api.types";

export function validateOrderProducts(payload: ValidateOrderPayload): Promise<Response> {
    return fetch("/api/orders/validate-products", {
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(payload),
        method: "post",
        credentials: "include"
    });
}

export function validateOrder(payload: ValidateOrderPayload): Promise<Response> {
    return fetch("/api/orders/validate", {
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(payload),
        method: "post",
        credentials: "include"
    });
}

export function getOrderDetails(id): Promise<Response> {
    return fetch("/api/orders/" + id + "/details", {
        credentials: "include"
    });
}

export function captureVippsOrder(id: String): Promise<Response> {
    return fetch("/api/orders/" + id + "/capture")
}

export function cancelOrder(id: String): Promise<Response> {
    return fetch("/api/orders/" + id + "/cancel")
}

export function refundOrder(id: String): Promise<Response> {
    return fetch("/api/orders/" + id + "/refund")
}

export function submitOrder(payload: SubmitOrderPayload): Promise<Response> {
    return fetch("/api/orders/submit", {
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(payload),
        method: "post",
        credentials: "include"
    });
}

export function getOrders(filter?: string): Promise<Response> {
    return fetch("/api/orders?filter=" + filter, {
        credentials: "include"
    });
}

export function getOrder(id): Promise<Response> {
    return fetch("/api/orders/" + id, {
        credentials: "include"
    });
}