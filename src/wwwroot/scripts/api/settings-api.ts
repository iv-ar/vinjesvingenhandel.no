export function setOrderEmailList(payload: string[]): Promise<Response> {
    return fetch("/api/settings/order-emails", {
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(payload),
        method: "post",
        credentials: "include"
    });
}

export function getOrderEmailList(): Promise<Response> {
    return fetch("/api/settings/order-emails", {
        method: "get",
        credentials: "include"
    });
}
