import {LoginPayload} from "./account-api.types"

export function login(payload: LoginPayload, xsrf: string): Promise<Response> {
    return fetch("/api/account/login", {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "XSRF-TOKEN": xsrf
        }
    });
}

export function logout(): Promise<Response> {
    return fetch("/api/account/logout");
}

export function updatePassword(newPassword: string): Promise<Response> {
    return fetch("/api/account/update-password", {
        method: "post",
        body: JSON.stringify({
            newPassword
        }),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });
}