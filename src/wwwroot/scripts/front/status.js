import {cartDispose} from "../cart-core";
import {pageInit} from "../base";

if (location.pathname.startsWith("/status")) {
    pageInit(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const clearCart = urlParams.get("clearCart");
        if (clearCart) cartDispose();
    });
}
