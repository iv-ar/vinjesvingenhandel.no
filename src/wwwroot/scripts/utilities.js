import {toaster} from "./base";
import {messages} from "./messages";

export const utilites = {
    dom: {
        restrictInputToNumbers(el, specials, mergeSpecialsWithDefaults) {
            el.addEventListener("keydown", e => {
                const defaultSpecials = [
                    "Backspace",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                ];
                let keys = specials ?? defaultSpecials;
                if (mergeSpecialsWithDefaults && specials) keys = [...specials, ...defaultSpecials];
                if (keys.indexOf(e.key) !== -1) {
                    return;
                }
                if (isNaN(parseInt(e.key))) {
                    e.preventDefault();
                }
            });
        },
        elementHasFocus: (el) => el === document.activeElement,
        moveFocus(element) {
            if (!element) element = document.getElementsByTagName("body")[0];
            element.focus();
            if (!this.elementHasFocus(element)) {
                element.setAttribute("tabindex", "-1");
                element.focus();
            }
        },
    },
    array: {
        isEmpty: (arr) => arr === undefined || !Array.isArray(arr) || arr.length <= 0,
        removeItemOnce(arr, value) {
            const index = arr.indexOf(value);
            if (index > -1) {
                arr.splice(index, 1);
            }
            return arr;
        },
        pushOrUpdate(arr, obj) {
            const index = arr.findIndex((e) => e.id === obj.id);
            if (index === -1) {
                arr.push(obj);
            } else {
                arr[index] = obj;
            }
        },
        removeItemAll(arr, value) {
            let i = 0;
            while (i < arr.length) {
                if (arr[i] === value) {
                    arr.splice(i, 1);
                } else {
                    ++i;
                }
            }
            return arr;
        },
        removeItemByIdAll(arr, value) {
            let i = 0;
            while (i < arr.length) {
                if (arr[i].id === value.id) {
                    arr.splice(i, 1);
                } else {
                    ++i;
                }
            }
            return arr;
        },
    },
    object: {
        // http://youmightnotneedjquery.com/#deep_extend
        extend(object, ext) {
            ext = ext || {};
            for (let i = 1; i < object.length; i++) {
                let obj = object[i];
                if (!obj) continue;
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === "object") {
                            if (obj[key] instanceof Array)
                                ext[key] = obj[key].slice(0);
                            else
                                ext[key] = this.extend(ext[key], obj[key]);
                        } else
                            ext[key] = obj[key];
                    }
                }
            }
            return ext;
        },
        isEmptyObj(obj) {
            return obj !== undefined && Object.keys(obj).length > 0;
        },
    },
    validators: {
        isEmail(input) {
            const re = /\S+@\S+\.\S+/;
            return re.test(input);
        },
    },
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    isInternetExplorer() {
        const ua = navigator.userAgent;
        return ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1;
    },
    toReadableDateString(date) {
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toLocaleString("nb-NO");
    },
    toReadableBytes(bytes) {
        const s = ["bytes", "kB", "MB", "GB", "TB", "PB"];
        const e = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
    },
    toReadablePriceSuffix(suffix) {
        switch (suffix) {
            case 0:
                return ",-";
            case 1:
                return ",- kg";
            case 2:
                return ",- stk";
        }
    },
    setSessionStorageJSON(key, object) {
        sessionStorage.setItem(key, JSON.stringify(object));
    },
    getSessionStorageJSON(key) {
        const dataString = sessionStorage.getItem(key);
        if (dataString === null) return undefined;
        return JSON.parse(dataString);
    },
    setLocalStorageJSON(key, object) {
        localStorage.setItem(key, JSON.stringify(object));
    },
    getLocalStorageJSON(key) {
        const dataString = localStorage.getItem(key);
        if (dataString === null) return undefined;
        return JSON.parse(dataString);
    },
    handleError: (httpResult, fallback) => {
        if (httpResult.headers !== undefined && httpResult.headers.get("ContentType") === "application/json") {
            httpResult.json().then(error => {
                console.error(error);
                toaster.errorObj(utilites.errorOrDefault(error, fallback));
            });
        } else {
            toaster.errorObj(fallback);
        }
    },
    getOrderStatusName: (status) => {
        switch (status) {
            case 0:
                return "Pågående";
            case 1:
                return "Kansellert";
            case 2:
                return "Feilet";
            case 3:
                return "Fullført";
            case 4:
                return "Venter på faktura";
            case 5:
                return "Venter på vipps";
            default:
                return "Ukjent";
        }
    },
    getOrderPaymentName: (status) => {
        switch (status) {
            case 0:
                return "Vipps";
            case 1:
                return "Faktura på mail";
            default:
                return "Ukjent";
        }
    },
    errorOrDefault: (res, fallback) => {
        let title;
        let message;

        if (res.title) title = res.title;
        else if (fallback.title) title = fallback.title;
        else title = messages.unknownError.title;

        if (res.message) message = res.message;
        else if (fallback.message) message = fallback.message;
        else message = messages.unknownError.message;

        return {
            title,
            message,
        };
    },
    // https://stackoverflow.com/a/15757499/11961742
    resolveReferences(json) {
        if (typeof json === "string")
            json = JSON.parse(json);

        const byid = {}, // all objects by id
            refs = []; // references to objects that could not be resolved
        json = (function recurse(obj, prop, parent) {
            if (typeof obj !== "object" || !obj) // a primitive value
                return obj;
            if (Object.prototype.toString.call(obj) === "[object Array]") {
                for (let i = 0; i < obj.length; i++) {
                    // check also if the array element is not a primitive value
                    if (typeof obj[i] !== "object" || !obj[i]) {// a primitive value
                        continue;
                    } else if ("$ref" in obj[i]) {
                        obj[i] = recurse(obj[i], i, obj);
                    } else {
                        obj[i] = recurse(obj[i], prop, obj);
                    }
                }
                return obj;
            }
            if ("$ref" in obj) { // a reference
                let ref = obj.$ref;
                if (ref in byid)
                    return byid[ref];
                // else we have to make it lazy:
                refs.push([parent, prop, ref]);
                return;
            } else if ("$id" in obj) {
                let id = obj.$id;
                delete obj.$id;
                if ("$values" in obj) // an array
                    obj = obj.$values.map(recurse);
                else // a plain object
                    for (let prop in obj)
                        obj[prop] = recurse(obj[prop], prop, obj);
                byid[id] = obj;
            }
            return obj;
        })(json); // run it!

        for (let i = 0; i < refs.length; i++) { // resolve previously unknown references
            let ref = refs[i];
            ref[0][ref[1]] = byid[ref[2]];
            // Notice that this throws if you put in a reference at top-level
        }
        return json;
    },
};
