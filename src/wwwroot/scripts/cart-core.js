import {utilites} from "./utilities";
import {configuration} from "./configuration";
import {getProducts} from "./api/products-api";

export function setCart(data) {
	return utilites.setSessionStorageJSON(configuration.storageKeys.cart, data);
}

export function getCart() {
	return utilites.getSessionStorageJSON(configuration.storageKeys.cart);
}

export function cartDispose() {
	sessionStorage.removeItem(configuration.storageKeys.cart);
}

export function priceTotal() {
	const cartData = getCart();
	if (utilites.array.isEmpty(cartData)) {
		return null;
	}
	let total = null;
	for (const product of cartData) {
		total += product.price * product.count;
	}
	return typeof total !== "number" ? total : total.toFixed(2) + ",-";
}

export function priceTax() {
	const cartData = getCart();
	if (utilites.array.isEmpty(cartData)) {
		return null;
	}
	let total = null;
	for (const product of cartData) {
		total += product.price * product.count;
	}
	return typeof total !== "number" ? total : ((total) * 25 / 100).toFixed(2) + ",-";
}

export function updatePricesFromApi() {
	return new Promise((ok, error) => {
		const cartData = getCart();
		if (!cartData) {

			ok();
			return;
		}
		getProducts().then(res => {
			if (res.ok) {
				res.json().then(apiProducts => {
					apiProducts = utilites.resolveReferences(apiProducts);
					for (const latestProduct of apiProducts) {
						const index = cartData.findIndex(c => c.id === latestProduct.id);
						if (index !== -1) {
							cartData[index].price = latestProduct.price;
						}
						if (index !== -1) {
							cartData[index].readablePrice = latestProduct.price + latestProduct.readablePriceSuffix;
						}
					}
					setCart(cartData);
					ok();
				});
			}
		});
	});
}

export function setProductCount(id, newCount) {
	const cartData = getCart();
	const productIndex = cartData.findIndex(c => c.id === id);
	cartData[productIndex].count = newCount;
	setCart(cartData);
}

export function removeProductFromCart(id, callback) {
	const cartData = getCart();
	if (utilites.array.isEmpty(cartData)) {
		return;
	}
	const updatedCart = utilites.array.removeItemByIdAll(cartData, {id});
	if (updatedCart.length === 0) {
		cartDispose();
	} else {
		setCart(updatedCart);
	}
	if (typeof callback === "function") {
		callback(updatedCart);
	}
}

export function addOrUpdateProduct(product, callback) {
	let cartData = getCart();
	if (utilites.array.isEmpty(cartData)) {
		cartData = [];
	}
	const indexOfCurrent = cartData.length === 0 ? -1 : cartData.findIndex(c => c.id === product.id);
	if (indexOfCurrent === -1 && product !== undefined) { // adding
		product.count = 1;
		cartData.push(product);
	} else if (indexOfCurrent !== -1) { // updating
		cartData[indexOfCurrent] = product;
	}
	setCart(cartData);
	if (typeof callback === "function") {
		callback();
	}
}
