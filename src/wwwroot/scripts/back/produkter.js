import {$, $$, doc, toaster} from "../base";
import {configuration} from "../configuration";
import {utilites} from "../utilities";
import {createCategory, deleteCategory, disableCategory, enableCategory, getCategories} from "../api/categories-api";
import {createProduct, deleteProduct, getProducts, updateProduct, uploadProductImages} from "../api/products-api";
import Modal from "bootstrap/js/dist/modal";
import Grid from "../grid";
import {messages} from "../messages";
import {eyeIcon, pencilSquareIcon, plusIcon, threeDotsVerticalIcon, trashIcon} from "../icons";
import {strings} from "../i10n.ts";

let shouldReloadProductsView;
const isProductsPage = location.pathname.startsWith("/kontoret/produkter");
const inputImages = $("#input-images-row");
const productsWrapper = $("#products");
const productsLoader = $("#products-loader");
const productForm = $("#product-form");
const productCategoriesPickerElement = $("#product-category-picker-wrapper #picker");
const productCategoriesPickerLoadingElement = $("#product-category-picker-wrapper #loader");
const productModalElement = $("#product-modal");
const submitProductFormButton = $("#submit-product-form");
const submitProductFormButtonSpinner = $("#submit-product-form .spinner-border");
const openProductModalButton = $("#open-product-modal");
const productModalTitle = $("#product-modal-title");
const productModal = isProductsPage ? new Modal(productModalElement, {
    backdrop: "static",
}) : undefined;

const newCategoryForm = $("#new-category-form");
const newCategoryName = $("#new-category-name");
const categoryModalElement = $("#categories-modal");
const categoryModal = isProductsPage ? new Modal(categoryModalElement) : undefined;
const categoryListElement = $("#categories-modal #list-wrapper");
const openCategoriesModalButton = $("#open-categories-modal");
const categoryListLoadingElement = $("#categories-modal #loading-wrapper");

if (isProductsPage) {
    renderProductsView();
    sessionStorage.removeItem(configuration.storageKeys.productForm.imageUrls);
    openProductModalButton.addEventListener("click", () => openProductModal(undefined, undefined));
    openCategoriesModalButton.addEventListener("click", openCategoriesModal);
}

/*
    PRODUCTS
*/

const grid = new Grid({
    search: {
        dataIds: ["name", ["category", "name"]],
    },
    strings: {
        search: strings.languageSpesific.search,
        nextPage: strings.languageSpesific.next_page,
        previousPage: strings.languageSpesific.previous_page,
    },
    classes: {
        table: "table table-bordered mt-3",
        thead: "table-primary",
    },
    columns: [
        {
            dataId: "name",
            minWidth: "250px",
            columnName: "Navn",
        },
        {
            columnName: "Beskrivelse",
            dataId: "description",
            maxWidth: "250px",
            minWidth: "250px",
            width: "250px",
        },
        {
            minWidth: "250px",
            dataId: ["category", "name"],
            columnName: "Kategori",
        },
        {
            minWidth: "100px",
            columnName: "Pris",
            cellValue: (row) => row.price + row.readablePriceSuffix,
        },
        {
            columnName: "",
            width: "80px",
            minWidth: "80px",
            cellValue: (row) => {
                const group = doc.createElement("div");
                group.className = "btn-group";
                const deleteProductButton = doc.createElement("button");
                deleteProductButton.className = "btn btn-link text-danger shadow-none p-0 ps-3";
                deleteProductButton.title = strings.languageSpesific.delete + ` "${row.name}"`;
                deleteProductButton.innerHTML = trashIcon("22", "22");
                deleteProductButton.onclick = () => removeProduct(row.id, row.name);
                const editProductButton = doc.createElement("button");
                editProductButton.className = "btn btn-link text-info shadow-none p-0";
                editProductButton.title = strings.languageSpesific.edit + ` "${row.name}"`;
                editProductButton.innerHTML = pencilSquareIcon();
                editProductButton.onclick = () => openProductModal(row);
                group.appendChild(editProductButton);
                group.appendChild(deleteProductButton);
                return group;
            },
        },
    ],
});

function renderProductsView() {
    productsWrapper.innerHTML = "";
    productsWrapper.classList.add("d-none");
    productsLoader.classList.remove("d-none");

    getProducts().then(res => {
        if (res.ok) {
            res.json().then(products => {
                grid.render(productsWrapper);
                products = utilites.resolveReferences(products);
                grid.refresh(products);
            });
            productsWrapper.classList.remove("d-none");
            productsLoader.classList.add("d-none");
        } else {
            utilites.handleError(res, {
                title: strings.languageSpesific.could_not_retrieve_products,
                message: strings.languageSpesific.try_again_soon,
            });
        }
    }).catch(error => {
        console.error(error);
        toaster.errorObj(messages.networkRequestFailed);
    });
}

function removeProduct(id, name) {
    if (!name || !id) return;
    if (confirm(`${strings.languageSpesific.are_you_sure_you_want_to_delete} ${name}?`)) {
        deleteProduct(id).then(res => {
            if (res.ok) {
                toaster.success(`${name} ${strings.languageSpesific.is_deleted_LC}`);
                grid.removeByID(id);
            } else {
                utilites.handleError(res, {
                    title: strings.languageSpesific.could_not_delete_product,
                    message: strings.languageSpesific.try_again_soon,
                });
            }
        }).catch(error => {
            console.error(error);
            toaster.errorObj(messages.networkRequestFailed);
        });
    }
}


function uploadFiles() {
    const input = doc.createElement("input");
    const maxFiles = 5;
    const maxFileSize = 2 * 1024 * 1024;
    input.type = "file";
    input.multiple = true;
    input.accept = "image/png,image/jpeg";
    input.onchange = (e) => {
        productForm.classList.add("loading");
        const files = e.target.files;

        if (files.length > maxFiles) {
            toaster.error(strings.languageSpesific.too_many_files, strings.languageSpesific.max_five_files_at_a_time);
            productForm.classList.remove("loading");
            return;
        }

        for (const file of files) {
            if (!input.accept.split(",").includes(file.type)) {
                toaster.error(strings.languageSpesific.invalid_file, file.name + " " + strings.languageSpesific.has_invalid_file_format_LC);
                productForm.classList.remove("loading");
                return;
            }
            if (file.size > maxFileSize) {
                toaster.error(strings.languageSpesific.too_big_file, file.name + " " + strings.languageSpesific.is_too_big_LC);
                productForm.classList.remove("loading");
                return;
            }
        }

        uploadProductImages(files).then(res => {
            if (res.ok) {
                res.json().then(fileNameArray => {
                    fileNameArray = utilites.resolveReferences(fileNameArray);
                    const sessionStorageImages = utilites.getSessionStorageJSON(configuration.storageKeys.productForm.imageUrls) ?? [];
                    const newImages = [...sessionStorageImages];
                    for (let i = 0; i < fileNameArray.length; i++) {
                        newImages.push({
                            order: i,
                            fileName: fileNameArray[i],
                        });
                    }
                    utilites.setSessionStorageJSON(configuration.storageKeys.productForm.imageUrls, newImages);
                    renderProductFormImages(() => {
                        productForm.classList.remove("loading");
                        if (inputImages.childNodes.length > 3) {
                            inputImages.scrollLeft = inputImages.scrollWidth;
                        }
                    });
                });
            } else {
                utilites.handleError(res, {
                    title: strings.languageSpesific.could_not_upload + " " + (files.length === 1
                        ? strings.languageSpesific.the_image.toLocaleLowerCase()
                        : strings.languageSpesific.the_images.toLocaleLowerCase()),
                    message: strings.languageSpesific.try_again_soon,
                });
                productForm.classList.remove("loading");
            }
        }).catch(error => {
            console.error(error);
            toaster.errorObj(messages.networkRequestFailed);
            productForm.classList.remove("loading");
        });
    };
    input.click();
}

function renderProductFormImages(cb) {
    inputImages.innerHTML = "";
    inputImages.appendChild(getAddImageCardButton());
    let images = utilites.getSessionStorageJSON(configuration.storageKeys.productForm.imageUrls);
    if (utilites.array.isEmpty(images)) return;
    images = images.sort(img => img.order);
    for (const image of images) {
        inputImages.appendChild(generateProductFormImageColumn(image));
    }
    // drag to scroll
    let pos = {top: 0, left: 0, x: 0, y: 0};
    let mouseIsDown;
    inputImages.addEventListener("mousemove", (e) => {
        if (mouseIsDown) {
            const dx = e.clientX - pos.x;
            // scroll
            inputImages.scrollLeft = pos.left - dx;
        }
    });
    inputImages.addEventListener("mousedown", (e) => {
        mouseIsDown = true;
        inputImages.style.cursor = "grabbing";
        inputImages.style.userSelect = "none";
        pos = {
            // current scroll 
            left: inputImages.scrollLeft,
            top: inputImages.scrollTop,
            // current mouse position
            x: e.clientX,
            y: e.clientY,
        };
    });
    inputImages.addEventListener("mouseup", () => {
        mouseIsDown = false;
        inputImages.style.removeProperty("cursor");
        inputImages.style.removeProperty("user-select");
    });

    if (typeof cb === "function") cb();
}


function getAddImageCardButton() {
    const wrapper = doc.createElement("div");
    wrapper.className = "col mw-100px";
    const button = doc.createElement("div");
    button.type = "button";
    button.onclick = () => uploadFiles();
    button.className = "btn btn-light p-3 d-flex align-items-center justify-content-center h-100 border-primary text-primary";
    button.innerHTML = plusIcon("32", "32");
    wrapper.appendChild(button);
    return wrapper;
}

function deleteImageFromSessionStorage(image) {
    const oldImages = utilites.getSessionStorageJSON(configuration.storageKeys.productForm.imageUrls);
    const newImages = [];
    for (const oldImage of oldImages)
        if (oldImage.fileName !== image.fileName)
            newImages.push(oldImage);
    utilites.setSessionStorageJSON(configuration.storageKeys.productForm.imageUrls, newImages);
    renderProductFormImages();
}

function generateProductFormImageColumn(image) {
    const wrapper = doc.createElement("div");
    wrapper.className = "col-3 product-form-image-thumbnail";

    const card = doc.createElement("div");
    card.className = "card";

    const img = doc.createElement("img");
    img.src = configuration.paths.products + image.fileName;
    img.className = "card-img";
    img.alt = strings.languageSpesific.picture_of_the_product;

    const cardOverlay = doc.createElement("div");
    cardOverlay.className = "card-img-overlay";

    const dropdownWrapper = doc.createElement("div");
    dropdownWrapper.className = "dropleft";

    const contextMenuButton = doc.createElement("div");
    contextMenuButton.className = "btn btn-light float-end context-menu-button";
    contextMenuButton.setAttribute("data-bs-toggle", "dropdown");
    contextMenuButton.setAttribute("aria-expanded", "false");
    contextMenuButton.type = "button";
    contextMenuButton.innerHTML = threeDotsVerticalIcon();

    const dropdownMenu = doc.createElement("ul");
    dropdownMenu.className = "dropdown-menu";

    const deleteMenuItem = doc.createElement("li");
    deleteMenuItem.innerText = `${strings.languageSpesific.delete} ${strings.languageSpesific.the_image.toLocaleLowerCase()}`;
    deleteMenuItem.onclick = () => deleteImageFromSessionStorage(image);
    deleteMenuItem.className = "text-danger dropdown-item";

    dropdownMenu.appendChild(deleteMenuItem);
    dropdownWrapper.appendChild(contextMenuButton);
    dropdownWrapper.appendChild(dropdownMenu);
    cardOverlay.appendChild(dropdownWrapper);
    card.appendChild(img);
    card.appendChild(cardOverlay);
    wrapper.appendChild(card);
    return wrapper;
}

function generateCategoryPickerItem(category, initialCategoryId = undefined) {
    const wrapper = doc.createElement("div");
    wrapper.className = "form-check form-check-inline";
    const radio = doc.createElement("input");
    radio.type = "radio";
    radio.name = "category";
    radio.className = "form-check-input";
    radio.value = category.id;
    radio.id = category.id;
    if (initialCategoryId !== undefined && category.id === initialCategoryId) radio.checked = true;
    const label = doc.createElement("label");
    label.className = "form-check-label cursor-pointer";
    label.innerHTML = category.disabled ? ("<span class='text-decoration-line-through'>" + category.name + "</span>") : category.name;
    label.htmlFor = category.id;
    wrapper.appendChild(radio);
    wrapper.appendChild(label);
    return wrapper;
}

function renderCategoriesPicker(initialCategoryId = undefined) {
    productCategoriesPickerElement.innerHTML = "";
    getCategories().then(res => {
        if (res.ok) {
            res.json().then(data => {
                let i = 0;
                data = utilites.resolveReferences(data);
                data.forEach(category => {
                    i++;
                    if (i % 3 === 1) productCategoriesPickerElement.appendChild(doc.createElement("br"));
                    if (initialCategoryId !== undefined)
                        productCategoriesPickerElement.appendChild(generateCategoryPickerItem(category, initialCategoryId));
                    else
                        productCategoriesPickerElement.appendChild(generateCategoryPickerItem(category));
                });
                productCategoriesPickerLoadingElement.classList.add("d-none");
                productCategoriesPickerElement.classList.remove("d-none");
            });
        } else {
            utilites.handleError(res, {
                title: strings.languageSpesific.could_not_retrieve_categories,
                message: strings.languageSpesific.try_again_soon,
            });
        }
    }).catch((error) => {
        console.error(error);
        toaster.errorObj(messages.networkRequestFailed);
    });
}

function submitProductForm() {
    const id = productModalElement.dataset.id;
    const isEditing = id !== "" && productModalElement.dataset.isEditing === "true";
    const payload = {
        name: $("#input-name").value,
        price: $("#input-price").value,
        priceSuffix: parseInt($("#input-price-suffix").value),
        description: $("#input-description").value,
        count: parseInt($("#input-count").value),
        showOnFrontpage: $("input[name='show-on-frontpage']:checked")?.checked ?? false,
        category: {
            id: $("input[name='category']:checked").value,
        },
        images: [],
    };

    if (!payload.count && payload.count !== 0) payload.count = -1;
    
    const images = utilites.getSessionStorageJSON(configuration.storageKeys.productForm.imageUrls);
    if (images !== undefined) {
        if (typeof images[0] !== "object") {
            for (let i = 0; i < images.length; i++) {
                payload.images.push({
                    order: i,
                    fileName: images[i],
                });
            }
        } else {
            payload.images = images;
        }
    }

    if (isEditing) payload.id = id;
    if (!payload.name || !payload.price || !payload.category.id) {
        toaster.error(strings.languageSpesific.invalid_form);
        return;
    }

    if (payload.price.substring(payload.price.lastIndexOf(".")).length > 3 || payload.price.split(".").length > 2) {
        toaster.error(strings.languageSpesific.invalid_form);
        return;
    }

    payload.price = parseFloat(payload.price);

    const action = isEditing ? updateProduct(payload) : createProduct(payload);
    productForm.classList.add("loading");
    submitProductFormButton.classList.add("disabled");
    submitProductFormButtonSpinner.classList.remove("d-none");
    action.then((res) => {
        if (res.ok) {
            shouldReloadProductsView = true;
            productModal.hide();
            sessionStorage.removeItem(configuration.storageKeys.productForm.imageUrls);
            productForm.classList.remove("loading");
            submitProductFormButton.classList.remove("disabled");
            submitProductFormButtonSpinner.classList.add("d-none");
        } else {
            utilites.handleError(res, {
                title: isEditing ? strings.languageSpesific.could_not_update_the_product : strings.languageSpesific.could_not_add_the_product,
                message: "Prøv igjen snart",
            });
            productForm.classList.remove("loading");
            submitProductFormButton.classList.remove("disabled");
            submitProductFormButtonSpinner.classList.add("d-none");
        }
    }).catch((error) => {
        console.error(error);
        toaster.errorObj(messages.networkRequestFailed);
        productForm.classList.remove("loading");
        submitProductFormButton.classList.remove("disabled");
        submitProductFormButtonSpinner.classList.add("d-none");
    });
}

function disposeNewProductModal() {
    if (shouldReloadProductsView) {
        renderProductsView();
        shouldReloadProductsView = false;
    }
    sessionStorage.removeItem(configuration.storageKeys.productForm.imageUrls);
    productModalElement.dataset.isEditing = "false";
    productForm.reset();
    productForm.classList.remove("loading");
    submitProductFormButton.removeEventListener("click", submitProductForm);
    console.log("disposed newProductModal");
}

function openProductModal(edit = undefined, initalCategoryId = undefined) {
    productForm.reset();
    productModalElement.addEventListener("hidden.bs.modal", disposeNewProductModal, {once: true});
    submitProductFormButton.addEventListener("click", submitProductForm);
    utilites.dom.restrictInputToNumbers($("#input-price"), ["."], true);
    utilites.dom.restrictInputToNumbers($("#input-count"), ["+", "-"], true);

    if (edit !== undefined) {
        if (!utilites.array.isEmpty(edit.images)) {
            utilites.setSessionStorageJSON(configuration.storageKeys.productForm.imageUrls, edit.images);
        }
        renderCategoriesPicker(edit.category.id);
        productModalElement.dataset.isEditing = "true";
        productModalElement.dataset.id = edit.id;
        $("#input-name").value = edit.name;
        $("#input-price").value = edit.price;
        $("#input-price-suffix").value = edit.priceSuffix;
        $("#input-count").value = edit.count;
        $("#show-on-frontpage").checked = edit.showOnFrontpage;
        $("#input-description").value = edit.description;
        productModalTitle.innerText = strings.languageSpesific.edit + " " + edit.name;
        $("#submit-product-form .text").innerText = strings.languageSpesific.save;
    } else {
        sessionStorage.removeItem(configuration.storageKeys.productForm.imageUrls);
        productModalTitle.innerText = strings.languageSpesific.new_product;
        $("#submit-product-form .text").innerText = strings.languageSpesific.create;
        productModalElement.dataset.isEditing = "false";
        productModalElement.dataset.id = "";
        if (initalCategoryId !== undefined)
            renderCategoriesPicker(initalCategoryId);
        else
            renderCategoriesPicker();
    }
    renderProductFormImages();
    productModal.show();
}


/*
    CATEGORIES
*/

function removeCategory(id, name) {
    if (!id || !name) return;
    if (confirm(`${strings.languageSpesific.are_you_sure_you_want_to_delete} ${name}?`)) {
        deleteCategory(id).then(res => {
            if (res.ok) {
                shouldReloadProductsView = true;
                renderCategoriesList();
            } else {
                utilites.handleError(res, {
                    title: strings.languageSpesific.could_not_delete_category,
                    message: strings.languageSpesific.try_again_soon,
                });
            }
        }).catch(err => {
            console.error(err);
            toaster.errorObj(messages.networkRequestFailed);
        });
    }
}

function setCategoryState(id, name, disabled) {
    if (typeof disabled !== "boolean" || !id || !name) return;
    const actionName = disabled ? ` ${strings.languageSpesific.hide_V.toLocaleLowerCase()} ` : ` ${strings.languageSpesific.show_V.toLocaleLowerCase()} `;
    const confirmText = `${strings.languageSpesific.are_you_sure_you_want_to} ${actionName} ${name} ${strings.languageSpesific.in_the_store.toLocaleLowerCase()}?`;
    if (confirm(confirmText)) {
        const action = disabled ? disableCategory(id) : enableCategory(id);
        action.then(res => {
            if (res.ok) {
                shouldReloadProductsView = true;
                renderCategoriesList();
            } else {
                utilites.handleError(res, {
                    title: `${strings.languageSpesific.could_not} ${actionName} ${name}`,
                    message: strings.languageSpesific.try_again_soon,
                });
            }
        }).catch(err => {
            console.error(err);
            toaster.errorObj(messages.networkRequestFailed);
        });
    }
}

function generateCategoryListItem(category) {
    const nameEl = doc.createElement("div");
    nameEl.className = "flex-grow-1";
    nameEl.innerText = category.name;

    const disabledCheckEl = doc.createElement("div");
    const disabledCheckInputEl = doc.createElement("input");
    disabledCheckEl.className = "form-check form-switch";

    if (category.disabled === true) {
        disabledCheckEl.title = `${strings.languageSpesific.show} ${category.name} ${strings.languageSpesific.in_the_store}`;
        disabledCheckInputEl.checked = false;
        disabledCheckInputEl.onclick = (e) => {
            e.preventDefault();
            disabledCheckInputEl.checked = false;
            setCategoryState(category.id, category.name, false);
        };
    } else if (category.disabled === false) {
        disabledCheckEl.title = `${strings.languageSpesific.hide} ${category.name} ${strings.languageSpesific.in_the_store}`;
        disabledCheckInputEl.checked = true;
        disabledCheckInputEl.onclick = (e) => {
            e.preventDefault();
            disabledCheckInputEl.checked = true;
            setCategoryState(category.id, category.name, true);
        };
    }
    disabledCheckInputEl.type = "checkbox";
    disabledCheckInputEl.className = "form-check-input";
    disabledCheckEl.appendChild(disabledCheckInputEl);

    const deleteButtonEl = doc.createElement("button");
    deleteButtonEl.className = "btn btn-link text-danger";
    deleteButtonEl.title = "Slett \"" + category.name + "\" for godt";
    deleteButtonEl.innerHTML = trashIcon("22", "22");
    deleteButtonEl.onclick = () => removeCategory(category.id, category.name);

    const secondParent = doc.createElement("div");
    secondParent.className = "d-flex align-items-center";
    secondParent.appendChild(nameEl);
    secondParent.appendChild(disabledCheckEl);
    secondParent.appendChild(deleteButtonEl);

    const parent = doc.createElement("div");
    parent.className = "list-group-item";
    parent.dataset.id = category.id;
    parent.appendChild(secondParent);

    return parent;
}

function renderCategoriesList() {
    categoryListElement.innerHTML = "";
    getCategories().then(res => {
        if (res.ok) {
            res.json().then(data => {
                data = utilites.resolveReferences(data);
                data.forEach(category => {
                    categoryListElement.appendChild(generateCategoryListItem(category));
                });
                categoryListLoadingElement.classList.add("d-none");
                categoryListElement.classList.remove("d-none");
            });
        } else {
            utilites.handleError(res, {
                title: strings.languageSpesific.could_not_retrieve_categories,
                message: strings.languageSpesific.try_again_soon,
            });
        }
    }).catch(err => {
        console.error(err);
        toaster.errorObj(messages.networkRequestFailed);
    });
}

function handleKeyUpWhenCategoriesModalIsVisible(e) {
    if (utilites.dom.elementHasFocus(newCategoryName) && e.key === "Enter") {
        e.preventDefault();
        if (newCategoryName.value) {
            newCategoryForm.classList.add("loading");
            createCategory(newCategoryName.value).then(res => {
                if (res.ok) {
                    shouldReloadProductsView = true;
                    renderCategoriesList();
                } else {
                    utilites.handleError(res, {
                        title: strings.languageSpesific.could_not_add_the_category,
                        message: strings.languageSpesific.try_again_soon,
                    });
                }
                newCategoryForm.classList.remove("loading");
            }).catch(err => {
                console.error(err);
                toaster.errorObj(messages.networkRequestFailed);
            });
        } else {
            toaster.error(strings.languageSpesific.name + " " + strings.languageSpesific.is_required_LC);
        }
    }
}

function disposeCategoriesModal() {
    if (shouldReloadProductsView) {
        renderProductsView();
        shouldReloadProductsView = false;
    }
    newCategoryForm.reset();
    doc.removeEventListener("keyup", handleKeyUpWhenCategoriesModalIsVisible);
    console.log("disposed categoriesModal");
}

function openCategoriesModal() {
    newCategoryForm.reset();
    doc.addEventListener("keyup", handleKeyUpWhenCategoriesModalIsVisible);
    categoryModalElement.addEventListener("hidden.bs.modal", disposeCategoriesModal, {
        once: true,
    });
    renderCategoriesList();
    categoryModal.show();
}
