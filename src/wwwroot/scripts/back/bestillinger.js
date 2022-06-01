import Grid from "../grid";
import {strings} from "../i10n";
import {$, doc, pageInit, toaster} from "../base";
import {eyeIcon} from "../icons";
import {utilites} from "../utilities";
import {messages} from "../messages";
import {cancelOrder, captureVippsOrder, getOrderDetails, getOrders, refundOrder} from "../api/order-api";
import Modal from "bootstrap/js/src/modal";

if (location.pathname.startsWith("/kontoret/bestillinger")) {
    const ordersLoader = $("#orders-loader");
    const ordersWrapper = $("#orders-wrapper");
    const orderInfoModalEl = $("#order-info-modal");
    const orderInfoModal = new Modal(orderInfoModalEl);

    const grid = new Grid({
        search: {
            dataIds: ["orderReference", ["contactInfo", "name"], ["contactInfo", "emailAddress"], ["contactInfo", "phoneNumber"]],
        },
        strings: {
            search: strings.languageSpesific.search,
            nextPage: strings.languageSpesific.next_page,
            previousPage: strings.languageSpesific.previous_page,
        },
        debug: location.href.includes("localhost"),
        classes: {
            table: "table table-bordered mt-3",
            thead: "table-primary",
        },
        columns: [
            {
                dataId: "orderReference",
                minWidth: "150px",
                columnName: "Referanse",
                className: "btn-link cursor-pointer",
                click: (row) => openViewOrderModal(row),
            },
            {
                columnName: "Navn",
                dataId: ["contactInfo", "name"],
                minWidth: "200px",
            },
            {
                columnName: "E-postadresse",
                dataId: ["contactInfo", "emailAddress"],
                minWidth: "200px",
            },
            {
                columnName: "Telefonnummer",
                dataId: ["contactInfo", "phoneNumber"],
                minWidth: "150px",
            },
            {
                dataId: "created",
                minWidth: "175px",
                cellValue: (row) => utilites.toReadableDateString(new Date(row.created)),
                columnName: "Dato",
            },
            {
                minWidth: "150px",
                columnName: "Status",
                cellValue: (row) => {
                    const status = doc.createElement("span");
                    switch (row.status) {
                        case 0: {
                            status.innerText = "Pågående";
                            break;
                        }
                        case 1: {
                            status.innerText = "Kansellert";
                            break;
                        }
                        case 2: {
                            status.innerText = "Feilet";
                            status.classList.add("text-danger");
                            break;
                        }
                        case 3: {
                            status.innerText = "Fullført";
                            status.classList.add("text-success");
                            break;
                        }
                        case 4: {
                            status.innerText = "Venter på faktura";
                            break;
                        }
                        case 5: {
                            status.innerText = "Venter på vipps";
                            break;
                        }
                    }
                    return status;
                },
            },
            {
                columnName: "",
                width: "40px",
                minWidth: "40px",
                cellValue: (row) => {
                    const viewOrder = doc.createElement("button");
                    viewOrder.className = "btn btn-link text-info shadow-none";
                    viewOrder.title = strings.languageSpesific.view + ` "${row.orderReference}"`;
                    viewOrder.innerHTML = eyeIcon();
                    viewOrder.onclick = () => openViewOrderModal(row);
                    return viewOrder;
                },
            },
        ],
    });

    if (location.pathname.startsWith("/kontoret/bestillinger")) {
        pageInit(() => {
            renderProductsView();
        });
    }

    function openViewOrderModal({id, orderReference}) {
        orderInfoModalEl.querySelector(".modal-title").innerText = orderReference;
        $("#loader").style.display = "";
        $("#loaded").style.display = "none";

        orderInfoModal.show();

        getOrderDetails(id).then(res => {
            if (res.ok) {
                res.json().then(order => {
                    order = utilites.resolveReferences(order);
                    $("#contact-info-name").innerText = order.contactInformation.name;
                    $("#contact-info-emailAddress").innerHTML = `<a href='mailto:${order.contactInformation.emailAddress}'>${order.contactInformation.emailAddress}</a>`;
                    $("#contact-info-phoneNumber").innerHTML = `<a href='tel:${order.contactInformation.phoneNumber}'>${order.contactInformation.phoneNumber}</a>`;
                    $("#order-reference").innerText = order.orderReference;
                    $("#order-date").innerText = new Date(order.orderDate).toLocaleDateString();
                    $("#order-payment-type").innerText = utilites.getOrderPaymentName(order.paymentType);
                    $("#order-status").innerText = utilites.getOrderStatusName(order.status);
                    if (order.comment && order.comment !== "") {
                        $("#order-comment").innerText = order.comment;
                        $("#order-comment").style.display = "inline-block";
                    } else {
                        $("#order-comment").style.display = "none";
                    }

                    if (order.paymentType === 0) {
                        if ([
                            "SALE",
                            "RESERVED",
                        ].includes(order.vippsTransactionStatus)) {
                            $("#vipps-order-refund").classList.remove("d-none");
                            $("#vipps-order-refund").onclick = () => {
                                if (confirm("Er du sikker på at du vil refundere ordren " + order.orderReference)) {
                                    $("#vipps-order-refund").classList.add("loading");
                                    refundOrder(order.id).then(res => {
                                        if (res.ok) {
                                            toaster.success("Refundert", "Ordren er refundert, og vipps har startet refundering");
                                        } else {
                                            console.error("Received non-successful status code when submitting refund order command");
                                            toaster.error("En feil oppstod", "Prøv å refundere i vipps portalen");
                                        }
                                        $("#vipps-order-refund").classList.remove("loading");
                                    }).catch(err => {
                                        $("#vipps-order-refund").classList.remove("loading");

                                        console.error("refund order NetworkRequest failed");
                                        toaster.error("En uventet feil oppstod");
                                        console.error(err);
                                    });
                                }
                            };
                        }

                        if ([
                            "SALE",
                            "RESERVED",
                        ].includes(order.vippsTransactionStatus)) {
                            $("#vipps-order-capture").classList.remove("d-none");
                            $("#vipps-order-capture").onclick = () => {
                                if (confirm("Er du sikker på at du vil fullføre ordren " + order.orderReference)) {
                                    $("#vipps-order-capture").classList.add("loading");
                                    captureVippsOrder(order.id).then(res => {
                                        if (res.ok) {
                                            toaster.success("Fullført", "Ordren er fullført, og vipps har registrert transaksjonen");
                                        } else {
                                            console.error("Received non-successful status code when submitting fulfill order command");
                                            toaster.error("En feil oppstod", "Prøv å fullføre i vipps portalen");
                                        }
                                        $("#vipps-order-capture").classList.remove("loading");
                                    }).catch(err => {
                                        $("#vipps-order-capture").classList.remove("loading");
                                        console.error("fulfill order NetworkRequest failed");
                                        toaster.error("En uventet feil oppstod");
                                        console.error(err);
                                    });
                                }
                            };
                        }

                        if ([
                            "SALE",
                            "RESERVED",
                        ].includes(order.vippsTransactionStatus)) {
                            $("#vipps-order-cancel").classList.remove("d-none");
                            $("#vipps-order-cancel").onclick = () => {
                                if (confirm("Er du sikker på at du vil kansellere ordren " + order.orderReference)) {
                                    $("#vipps-order-cancel").classList.add("loading");
                                    cancelOrder(order.id).then(res => {
                                        if (res.ok) {
                                            toaster.success("Kansellert", "Ordren er kansellert");
                                        } else {
                                            console.error("Received non-successful status code when submitting cancel order command");
                                            toaster.error("En feil oppstod", "Prøv å kansellere i vipps portalen");
                                        }
                                        $("#vipps-order-cancel").classList.remove("loading");
                                    }).catch(err => {
                                        $("#vipps-order-cancel").classList.remove("loading");
                                        console.error("cancel order NetworkRequest failed");
                                        toaster.error("En uventet feil oppstod");
                                        console.error(err);
                                    });
                                }
                            };
                        }


                        switch (order.vippsTransactionStatus) {
                            case "SALE":
                                $("#vipps-status").innerText = "Salg (fullført og overført)";
                                break;
                            case "RESERVED":
                                $("#vipps-status").innerText = "Reservert";
                                break;
                            case "CANCELLED":
                                $("#vipps-status").innerText = "Kansellert";
                                break;
                            case "REJECTED":
                                $("#vipps-status").innerText = "Avslått";
                                break;
                            case "SALE_FAILED":
                                $("#vipps-status").innerText = "Salg feilet";
                                break;
                            case "AUTO_CANCEL":
                                $("#vipps-status").innerText = "Automatisk kansellering";
                                break;
                            case "RESERVE_FAILED":
                                $("#vipps-status").innerText = "Reservering feilet";
                                break;
                        }
                        $("#vipps-link").innerHTML = `<a href='https://portal.vipps.no/61861/transactions/${order.vippsId}' target="_blank">Åpne bestillingen i Vipps-portalen</a>`;
                        $("#vipps-section").classList.remove("d-none");
                    } else {
                        $("#vipps-section").classList.add("d-none");
                    }

                    orderInfoModalEl.querySelector(".modal-body").style.display = "";

                    const productsBody = orderInfoModalEl.querySelector("tbody");
                    productsBody.innerHTML = "";
                    let productIndex = 1;
                    let totalPrice = 0;
                    for (const product of order.products) {
                        const rowItem = doc.createElement("tr");
                        const nrCell = doc.createElement("td");
                        nrCell.innerText = productIndex.toString();
                        const nameCell = doc.createElement("td");
                        nameCell.innerText = product.name;
                        const countCell = doc.createElement("td");
                        countCell.innerText = product.count;
                        const priceCell = doc.createElement("td");
                        const totalSum = product.payedPrice * product.count;
                        priceCell.innerText = `${product.payedPrice} (totalt: ${totalSum})`;

                        rowItem.appendChild(nrCell);
                        rowItem.appendChild(nameCell);
                        rowItem.appendChild(countCell);
                        rowItem.appendChild(priceCell);
                        productsBody.appendChild(rowItem);
                        productIndex++;
                        totalPrice += totalSum;
                    }
                    $("#order-total").innerText = totalPrice;
                    $("#loader").style.display = "none";
                    $("#loaded").style.display = "";
                    orderInfoModal.show();
                });
            } else {
                toaster.error("En feil oppstod", "Kunne ikke hente ordren, prøv igjen snart!");
            }
        }).catch(error => {
            console.error(error);
        });
    }

    function renderProductsView() {
        ordersWrapper.innerHTML = "";
        ordersWrapper.classList.add("d-none");
        ordersLoader.classList.remove("d-none");

        getOrders("not-cancelled").then(res => {
            if (res.ok) {
                res.json().then(products => {
                    grid.render(ordersWrapper);
                    products = utilites.resolveReferences(products);
                    grid.refresh(products);
                    const queryOrderRef = new URL(location.href).searchParams.get("order");
                    if (queryOrderRef) {
                        const product = products.find(c => c.orderReference === queryOrderRef);
                        openViewOrderModal(product);
                    }
                });
                ordersWrapper.classList.remove("d-none");
                ordersLoader.classList.add("d-none");
            } else {
                utilites.handleError(res, {
                    title: strings.languageSpesific.could_not_retrieve_orders,
                    message: strings.languageSpesific.try_again_soon,
                });
            }
        }).catch(error => {
            console.error(error);
            toaster.errorObj(messages.networkRequestFailed);
        });
    }
}
