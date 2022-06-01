import {utilites} from "../utilities";
import {$, doc, pageInit} from "../base";
import {
    cartDispose,
    getCart,
    priceTax,
    priceTotal,
    removeProductFromCart,
    setProductCount,
    updatePricesFromApi,
} from "../cart-core";

import {getCounterControl} from "../components";
import {strings} from "../i10n.ts";
import {submitOrder} from "../api/order-api";
import "bootstrap/js/dist/tab";

const inputName = $("#input-name");
const inputEmail = $("#input-email");
const inputPhone = $("#input-phone");
const inputComment = $("#input-comment");
const invoiceMail = $("#invoice-mail");

const orderSummaryWrapper = $("#order-summary-wrapper");
const submitOrderWrapper = $("#submit-order-wrapper");
const orderSummaryLoader = $("#order-summary-spinner");
const total = $("#total-wrapper");

function setOrderSummaryLoaderVisibility(show = false) {
    if (show) {
        orderSummaryWrapper.classList.add("d-none");
        orderSummaryLoader.classList.remove("d-none");
    } else {
        orderSummaryWrapper.classList.remove("d-none");
        orderSummaryLoader.classList.add("d-none");
    }
}

function renderOverview() {
    setOrderSummaryLoaderVisibility(true);
    const cartData = getCart();
    if (utilites.array.isEmpty(cartData)) {
        const noItemsAlert = doc.createElement("div");
        noItemsAlert.className = "alert alert-primary";
        noItemsAlert.innerHTML = `${strings.languageSpesific.the_shopping_bag_is_empty}, ${strings.languageSpesific.go_to} <a href='/produktar'>/produktar</a> ${strings.languageSpesific.to_add_LC}`;
        orderSummaryWrapper.appendChild(noItemsAlert);
        setOrderSummaryLoaderVisibility(false);
        orderSummaryWrapper.querySelector("table").classList.add("d-none");
        total.classList.add("d-none");
        submitOrderWrapper.classList.add("d-none");
        return;
    }
    const tbody = orderSummaryWrapper.querySelector("tbody");
    tbody.innerHTML = "";
    for (const product of cartData)
        tbody.appendChild(getProductTableRow(product));
    updateTotal();
    setOrderSummaryLoaderVisibility(false);
}

function updateTotal() {
    total.querySelector("#total-sum").innerText = priceTotal();
    total.querySelector("#total-tax").innerText = priceTax();
}

function getProductTableRow(product) {
    const row = doc.createElement("tr");

    const productCell = doc.createElement("td");
    productCell.innerText = product.name;

    const priceTotalCell = doc.createElement("td");
    priceTotalCell.innerText = (product.price * product.count).toFixed(2) + ",-";

    const countCell = doc.createElement("td");

    const counterControl = getCounterControl({
        initialCount: product.count,
        min: "0",
        max: product.maxCount,
        onChange: (e) => {
            const newCount = parseInt(e.target.value);
            if (newCount === 0) {
                removeProductFromCart(product.id, (updatedCart) => {
                    if (updatedCart.length >= 1) {
                        row.remove();
                        updateTotal();
                    } else {
                        renderOverview();
                    }
                });
                return;
            }
            setProductCount(product.id, newCount);
            priceTotalCell.innerText = (product.price * newCount).toFixed(2) + ",-";
            updateTotal();
        },
    });
    counterControl.style.height = "30px";
    countCell.appendChild(counterControl);

    const priceCell = doc.createElement("td");
    priceCell.innerText = product.readablePrice;

    row.appendChild(productCell);
    row.appendChild(countCell);
    row.appendChild(priceCell);
    row.appendChild(priceTotalCell);

    return row;
}

function getOrderPayload() {
    const payload = {
        comment: inputComment.value,
        contactInfo: {
            name: inputName.value,
            emailAddress: inputEmail.value,
            phoneNumber: inputPhone.value,
        },
        products: [],
    };
    const cartData = getCart();
    if (utilites.array.isEmpty(cartData)) return undefined;
    for (const item of cartData) {
        if (payload.products.findIndex(c => c.id === item.id) !== -1) continue;
        payload.products.push({
            id: item.id,
            numberOfItems: item.count,
        });
    }
    return payload;
}

function isSubmitOrderFormValid() {
    return (
        inputName.value &&
        inputEmail.value &&
        inputPhone.value &&
        $("#vipps-terms-confirm").checked || $("#invoice-terms-confirm").checked
    );
}

function submitOrderForm(type) {
    if (isSubmitOrderFormValid()) {
        const payload = getOrderPayload();
        if (payload === undefined) return;
        payload.paymentType = type;
        $("#submit-order-form").classList.add("loading");
        $("#form-errors").classList.add("d-none");
        $("#form-errors").innerHTML = "";
        submitOrder(payload).then(res => {
            if (res.ok) {
                res.text().then(continueTo => {
                    window.location.replace(continueTo.replaceAll("\"", ""));
                });
            } else {
                console.log(res.headers.get("Content-Type"));
                if (res.headers.get("Content-Type")?.startsWith("application/json")) {
                    res.json().then(errorJson => {
                        if (errorJson.isValid === false) {
                            errorJson = utilites.resolveReferences(errorJson);
                            for (const error of errorJson.errors) {
                                if (error.id == null) {
                                    const listItem = doc.createElement("li");
                                    if (error.errors.length === 1) {
                                        listItem.innerText = error.errors[0];
                                    } else {
                                        let html;
                                        for (const itemError of error.errors) {
                                            html += itemError + "<br>";
                                        }
                                        listItem.innerHTML = html;
                                    }
                                    $("#form-errors").appendChild(listItem);
                                } else {
                                    const cartproducts = getCart();
                                    const errorProduct = cartproducts.find(c => c.id === error.id);
                                    const listItem = doc.createElement("li");
                                    if (error.errors.length === 1) {
                                        listItem.innerHTML = `<b>${errorProduct.name}:</b> ${error.errors[0]}`;
                                    } else {
                                        let html = "";
                                        for (const itemError of error.errors) {
                                            html += `<b>${errorProduct.name}:</b> ${itemError} <br>`;
                                        }
                                        listItem.innerHTML = html;
                                    }
                                    $("#form-errors").appendChild(listItem);
                                }
                            }
                            $("#form-errors").classList.remove("d-none");
                            $("#submit-order-form").classList.remove("loading");
                        } else {
                            utilites.handleError(res, {
                                title: strings.languageSpesific.an_unknown_error_occured,
                                message: strings.languageSpesific.try_again_soon,
                            });
                            $("#submit-order-form").classList.remove("loading");
                        }
                    });
                } else {
                    utilites.handleError(res, {
                        title: strings.languageSpesific.an_unknown_error_occured,
                        message: strings.languageSpesific.try_again_soon,
                    });
                    $("#submit-order-form").classList.remove("loading");
                }
            }
        })
        .catch(err => {
            console.error(err);
        });
    }
}

window.disposeCart = () => {
    cartDispose();
    location.href = "/";
};

function handleCallbackError() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    console.log(error);
    switch (error) {
        case "cancelled":
            $("#order-alert").classList.remove("d-none");
            $("#order-alert").innerHTML = "Din bestilling er kansellert! <span class='btn btn-link' onclick='disposeCart()' title='Slett handlekorgen'>Klikk her for å slette handlekorgen</span>";
            break;
        case "failed":
            $("#order-alert").classList.remove("d-none");
            $("#order-alert").innerHTML = "Bestillingen feilet, venlegst prøv igjen eller <a href='/#kontakt'>ta kontakt</a> med oss hvis problemet vedvarer!";
            break;
    }
    urlParams.delete("error");
}

if (location.pathname.startsWith("/handlekorg")) {
    pageInit(() => {
        updatePricesFromApi().then(() => {
            $(".submit-vipps").addEventListener("click", () => submitOrderForm(0));
            $(".submit-invoice").addEventListener("click", () => submitOrderForm(1));
            inputEmail.addEventListener("keyup", (e) => {
                if (utilites.validators.isEmail(e.target.value)) {
                    invoiceMail.innerText = e.target.value;
                } else {
                    invoiceMail.innerText = "din e-postadresse";
                }
            });

            renderOverview();
        });
        handleCallbackError();
    });
}
