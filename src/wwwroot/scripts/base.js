import {Toaster} from "./toaster";
import {configuration} from "./configuration";

export const toaster = new Toaster();
export const doc = document,
    $$ = (s, o = doc) => o.querySelectorAll(s),
    $ = (s, o = doc) => o.querySelector(s);

function toggleDarkTheme() {
    if (localStorage["dark-theme"] === "true") localStorage["dark-theme"] = "false";
    else localStorage["dark-theme"] = "true";
    setTheme();
}

function setTheme() {
    if (localStorage["dark-theme"] === "true") {
        document.getElementsByTagName("html")[0].setAttribute("dark-theme", "");
    } else {
        document.getElementsByTagName("html")[0].removeAttribute("dark-theme");
    }
}

window.addEventListener("error", (e) => {
    if (configuration.analytics.error) {
        (async () => {
            const error = {
                msg: e.message,
                line: e.lineno,
                path: location.pathname,
                filename: e.filename,
            };
            await fetch("/api/analytics/error", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(error),
            });
        })();
    }
});

window.addEventListener("load", () => {
    if (configuration.analytics.pageload && !location.pathname.startsWith("/kontoret")) {
        (async () => {
            //const loadTime = window.performance.timing.domContentLoadedEventEnd -
            // window.performance.timing.navigationStart;
            const loadTime = window.performance.timeOrigin - window.performance.now();
            await fetch("/api/analytics/pageload", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({time: loadTime, path: location.pathname}),
            });
        })();
    }
});

// https://stackoverflow.com/a/18234317/11961742
String.prototype.formatUnicorn = String.prototype.formatUnicorn || function () {
    "use strict";
    let str = this.toString();
    if (arguments.length) {
        const t = typeof arguments[0];
        const args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (const key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

setTheme();

export function pageInit(cb) {
    if (typeof cb === "function") cb();
}

doc.addEventListener("DOMContentLoaded", pageInit);
