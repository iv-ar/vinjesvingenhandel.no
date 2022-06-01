import {validateOrderProducts} from "../api/order-api";
import {$, $$, doc, pageInit, toaster} from "../base";
import Modal from "bootstrap/js/dist/modal";
import Carousel from "bootstrap/js/dist/carousel";
import {utilites} from "../utilities";
import {
    addOrUpdateProduct,
    cartDispose,
    getCart,
    priceTotal,
    removeProductFromCart,
    setProductCount,
} from "../cart-core";
import {getCounterControl} from "../components";
import {messages} from "../messages";
import {strings} from "../i10n.ts";

const headerCartButton = $("#header-cart-button");
const headerCartButtonCount = $("#header-cart-button #item-count");
const cartViewRoot = $("#cart-modal #product-list");
const submitCartButton = $("#cart-modal .submit-cart");
const cartModalElement = $("#cart-modal");
const cartModal = new Modal(cartModalElement, {
    keyboard: false,
});

const isProductPage = location.pathname.startsWith("/produktar") && location.pathname.match(/\/./g).length === 3;
const isProductsGridPage = location.pathname.startsWith("/produktar") && location.pathname.match(/\/./g).length <= 2;

if (!location.pathname.startsWith("/handlekorg")) {
    pageInit(() => {
        renderHeaderIcon(false);
        renderProductButtons();
        cartModalElement.addEventListener("show.bs.modal", () => {
            renderCartView();
            renderTotalView();
        });
        headerCartButton.addEventListener("click", () => cartModal.toggle());
        submitCartButton.addEventListener("click", () => submitCart());
    });
} else {
    headerCartButton.classList.add("d-none");
}

if (location.pathname.match("(\/produktar\/.*\/.*)") !== null && $("#carousel-navigator") !== null) {
    const carousel = new Carousel($("#product-carousel"));
    $$(".thumb-button").forEach(el => {
        const index = el.dataset.thumbIndex;
        el.onclick = () => carousel.to(index);
    });
}

function dispose() {
    cartDispose();
    renderHeaderIcon();
    renderCartView();
    renderTotalView();
    renderProductButtons();
}

function renderProductButtons() {
    const cartData = getCart();
    if (isProductPage) {
        const productWrapper = $("#single-product-wrapper");
        const productId = productWrapper.dataset.id;
        const productIndex = utilites.array.isEmpty(cartData) ? -1 : cartData.findIndex(c => c.id === productId);
        const bagButton = productWrapper.querySelector(".buttons .bag-button") ?? doc.createElement("dummy");
        const counterWrapper = productWrapper.querySelector(".buttons .counter-wrapper") ?? doc.createElement("dummy");
        bagButton.classList.remove("disabled");
        counterWrapper.innerHTML = "";

        if (productIndex !== -1) {
            const maxProductCount = bagButton.dataset.productMaxCount === "-1" ? 99999 : bagButton.dataset.productMaxCount;
            const minProductCount = "0";
            const product = cartData[productIndex];
            bagButton.classList.add("d-none");
            counterWrapper.appendChild(getCounterControl({
                initialCount: product.count,
                min: minProductCount,
                max: maxProductCount,
                onChange: (e) => {
                    let newCount = e.target.value;
                    if (newCount <= minProductCount) {
                        removeProduct(product.id);
                        bagButton.classList.remove("d-none");
                        return;
                    }

                    if (newCount > maxProductCount) newCount = maxProductCount;
                    setProductCount(product.id, parseInt(newCount));
                    renderHeaderIcon();
                    $$("[data-id='" + product.id + "'] .counter-wrapper").forEach(el => {
                        el.querySelector(".number-input input").value = parseInt(newCount);
                    });
                },
            }));
        } else {
            bagButton.innerHTML = "Legg i handlekorgen";
            bagButton.onclick = () => addProduct(productId);
            bagButton.classList.remove("d-none");
        }
    } else if (isProductsGridPage) {
        $$(".product-card").forEach(productCard => {
            const productId = productCard.dataset.id;
            const bagButton = productCard.querySelector(".buttons .bag-button") ?? doc.createElement("dummy");
            const counterWrapper = productCard.querySelector(".buttons .counter-wrapper") ?? doc.createElement("dummy");
            const productIndex = utilites.array.isEmpty(cartData) ? -1 : cartData.findIndex(c => c.id === productId);
            bagButton.classList.remove("disabled");
            counterWrapper.innerHTML = "";

            if (productIndex !== -1) {
                const maxProductCount = bagButton.dataset.productMaxCount === "-1" ? 99999 : bagButton.dataset.productMaxCount;
                const minProductCount = "0";
                const product = cartData[productIndex];
                bagButton.innerHTML = "Legg i handlekorgen";
                bagButton.classList.add("d-none");
                counterWrapper.appendChild(getCounterControl({
                    initialCount: product.count,
                    min: minProductCount,
                    max: maxProductCount,
                    onChange: (e) => {
                        let newCount = e.target.value;
                        if (newCount <= minProductCount) {
                            removeProduct(product.id);
                            bagButton.classList.remove("d-none");
                            return;
                        }
                        if (newCount > maxProductCount) newCount = maxProductCount;
                        setProductCount(product.id, parseInt(newCount));
                        renderHeaderIcon();
                        $$("[data-id='" + product.id + "'] .counter-wrapper").forEach(el => {
                            el.querySelector(".number-input input").value = parseInt(newCount);
                        });

                    },
                }));
            } else {
                bagButton.innerHTML = "Legg i handlekorgen";
                bagButton.onclick = () => addProduct(productId);
                bagButton.classList.remove("d-none");
            }
        });
    }
}

function getProductDataFromHtml(id) {
    if (isProductsGridPage) {
        const card = $(".product-card[data-id='" + id + "']");
        if (card === undefined) return card;
        const bagButton = card.querySelector(".bag-button");
        return {
            id: id,
            name: card.querySelector(".card-title").innerText,
            price: card.querySelector(".product-price").dataset.price,
            readablePrice: card.querySelector(".product-price").innerText,
            maxCount: bagButton.dataset.productMaxCount === "-1" ? 99999 : bagButton.dataset.productMaxCount,
        };
    } else if (isProductPage) {
        const productWrapper = $("#single-product-wrapper[data-id='" + id + "']");
        if (productWrapper === undefined) return productWrapper;
        const bagButton = productWrapper.querySelector(".bag-button");
        return {
            id: id,
            name: productWrapper.querySelector(".title").innerText,
            description: productWrapper.querySelector(".description").innerText,
            price: productWrapper.querySelector(".product-price").dataset.price,
            readablePrice: productWrapper.querySelector(".product-price").innerText,
            maxCount: bagButton.dataset.productMaxCount === "-1" ? 99999 : bagButton.dataset.productMaxCount,
        };
    }
}

function addProduct(id) {
    addOrUpdateProduct(getProductDataFromHtml(id), () => {
        renderHeaderIcon();
        renderProductButtons();
    });
}

function removeProduct(id) {
    removeProductFromCart(id, () => {
        renderHeaderIcon();
        renderTotalView();
        renderCartView();
        renderProductButtons();
    });
}

function renderHeaderIcon() {
    const cartData = getCart();
    if (utilites.array.isEmpty(cartData)) {
        headerCartButtonCount.innerText = "0";
        return;
    }
    const currentCount = parseInt(headerCartButtonCount.innerText);
    let count = 0;
    for (const product of cartData)
        count += product.count;

    if (currentCount !== count) {
        headerCartButtonCount.innerText = count >= 1 ? count : "0";
    }
}

function getProductListItemHTML(product) {
    console.log(product);
    const wrapper = doc.createElement("div");
    wrapper.dataset.id = product.id;
    wrapper.className = "mb-3";

    const card = doc.createElement("div");
    card.className = "card";

    const cardHeaderWrapper = doc.createElement("div");
    cardHeaderWrapper.className = "card-header d-flex justify-content-between align-items-center";

    const cardHeader = doc.createElement("h5");
    cardHeader.className = "mb-0";
    cardHeader.innerText = product.name;
    cardHeaderWrapper.appendChild(cardHeader);
    const removeProductButton = doc.createElement("button");
    removeProductButton.className = "btn btn-link shadow-none text-danger pe-0";
    removeProductButton.innerText = "Slett";
    removeProductButton.onclick = () => removeProduct(product.id);
    cardHeaderWrapper.appendChild(removeProductButton);

    card.appendChild(cardHeaderWrapper);
    const cardBody = doc.createElement("div");
    cardBody.className = "card-body";

    const itemCountWrapper = doc.createElement("div");
    itemCountWrapper.className = "d-flex justify-content-between align-items-center";

    itemCountWrapper.appendChild(getCounterControl({
        initialCount: product.count,
        min: "0",
        max: product.maxCount,
        onChange: (e) => {
            let newCount = e.target.value;
            if (newCount <= "0") {
                removeProduct(product.id);
                return;
            }
            if (newCount > product.maxCount) newCount = product.maxCount;
            setProductCount(product.id, parseInt(newCount));
            renderHeaderIcon();
            $$("[data-id='" + product.id + "'] .counter-wrapper").forEach(el => {
                el.querySelector(".number-input input").value = newCount;
            });
            renderTotalView();
        },
    }));

    const price = doc.createElement("div");
    price.className = "h3";
    price.innerText = product.readablePrice;
    itemCountWrapper.appendChild(price);


    cardBody.append(itemCountWrapper);
    card.appendChild(cardBody);
    wrapper.appendChild(card);
    return wrapper;
}

function renderTotalView() {
    const cartTotal = priceTotal();
    if (cartTotal == null) {
        $("#cart-modal .modal-footer").classList.add("d-none");
        $("#total").innerText = "";
    } else {
        $("#cart-modal .modal-footer").classList.remove("d-none");
        $("#total").innerText = cartTotal;
    }
}

function renderCartView() {
    const cartData = getCart();
    cartViewRoot.innerHTML = "";
    if (utilites.array.isEmpty(cartData)) {
        const noItemsAlert = doc.createElement("div");
        noItemsAlert.className = "alert alert-primary";
        noItemsAlert.role = "alert";
        noItemsAlert.innerHTML = `${strings.languageSpesific.the_shopping_bag_is_empty}, ${strings.languageSpesific.go_to_LC} <a href='/produktar'>/produktar</a> ${strings.languageSpesific.to_add_LC}`;
        cartViewRoot.appendChild(noItemsAlert);
    } else {
        for (const product of cartData)
            cartViewRoot.appendChild(getProductListItemHTML(product));
    }
}

function validateCartModal() {
    return new Promise((greatSuccess, graveFailure) => {
        const payload = {
            products: [],
        };

        const cartData = getCart();
        if (utilites.array.isEmpty(cartData)) {
            toaster.error(strings.languageSpesific.the_shopping_bag_is_empty);
            return;
        }

        for (const product of cartData) {
            payload.products.push({
                id: product.id,
                count: product.count,
            });
        }

        validateOrderProducts(payload).then(res => {
            if (res.ok) {
                res.json().then(json => {
                    if (json.isValid) {
                        return greatSuccess(true);
                    } else {
                        toaster.error(strings.languageSpesific.invalid_form);
                        //TODO: show validation errors
                        return greatSuccess(false);
                    }
                });
            } else {
                utilites.handleError(res, {
                    title: strings.languageSpesific.could_not_validate_your_order,
                    message: strings.languageSpesific.try_again_soon,
                });
            }
        }).catch(err => {
            console.error(err);
            toaster.errorObj(messages.unknownError);
        });
    });
}

function submitCart() {
    validateCartModal().then(isValid => {
        if (isValid === true) {
            location.href = "/handlekorg";
        }
    });
}
