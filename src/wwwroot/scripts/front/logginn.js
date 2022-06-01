import {$, pageInit} from "../base";
import {utilites} from "../utilities";
import {login} from "../api/account-api";
import {strings} from "../i10n.ts";

const submitButton = $("#submit");
const submitButtonSpinner = $("#submit .spinner-border");
const errorContainer = $("#error");
const errorMessage = $("#error-message");
const errorTitle = $("#error-title");
const continueTo = new URL(location.href).searchParams.get("ReturnUrl")
    ? new URL(location.href).searchParams.get("ReturnUrl")
    : "/kontoret";
const email = $("#input-email");
const password = $("#input-password");
const persist = $("#persist-session");
const loginForm = $("#login-form");

const loading = {
    show() {
        submitButton.classList.add("disabled");
        submitButtonSpinner.classList.remove("d-none");
    },
    hide() {
        submitButton.classList.remove("disabled");
        submitButtonSpinner.classList.add("d-none");
    },
};

const error = {
    show(title = strings.languageSpesific.an_error_occured, message = strings.languageSpesific.try_again_soon) {
        errorMessage.innerText = message;
        errorTitle.innerText = title;
        errorContainer.classList.remove("d-none");
    },
    hide() {
        errorMessage.innerText = "";
        errorTitle.innerText = "";
        errorContainer.classList.add("d-none");
    },
};

const form = {
    submit() {
        loading.show();
        error.hide();
        let payload = {
            username: email.value,
            password: password.value,
            persist: persist.checked,
        };
        login(payload, $("input[name=\"xsrf\"]").value).then((response) => {
            if (response.status === 200) {
                error.hide();
                location.href = continueTo;
            } else {
                utilites.handleError(response, {
                    title: strings.languageSpesific.an_unknown_error_occured,
                    message: strings.languageSpesific.try_again_soon,
                });
                loading.hide();
            }
        }).catch((err) => console.log(err));
    },
    isValid() {
        email.removeAttribute("aria-invalid");
        password.removeAttribute("aria-invalid");
        if (!email.value || !utilites.validators.isEmail(email.value)) {
            error.show(undefined, strings.languageSpesific.the_email_address + " " + strings.languageSpesific.is_invalid_LC);
            email.setAttribute("aria-invalid", "true");
            return false;
        }
        if (!password.value) {
            error.show(undefined, strings.languageSpesific.the_password + " " + strings.languageSpesific.is_invalid_LC);
            password.setAttribute("aria-invalid", "true");
            return false;
        }
        return true;
    },
};

if (location.pathname.startsWith("/logginn")) {
    pageInit(() => {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (form.isValid()) {
                form.submit();
            }
        });
    });
}
