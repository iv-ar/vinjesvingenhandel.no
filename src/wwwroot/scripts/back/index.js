import {$, toaster} from "../base";
import {logout, updatePassword} from "../api/account-api";
import {Modal} from "bootstrap";
import {utilites} from "../utilities";
import {messages} from "../messages";
import {strings} from "../i10n.ts";

const updatePasswordModalElement = $("#update-password-modal");
const updatePasswordModal = new Modal(updatePasswordModalElement);
const logoutButton = $(".logout-btn");
const newPasswordInput = $("#input-new-password");
const submitNewPasswordFormButton = $("#submit-new-password-form");

logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm(strings.languageSpesific.are_you_sure)) {
        logout().then((res) => {
            if (res.status === 200) {
                setTimeout(function () {
                    location.href = "/";
                }, 500);
            }
        });
    }
});

function initSetpasswordModal() {
    newPasswordInput.value = "";
    submitNewPasswordFormButton.addEventListener("click", () => {
        if (newPasswordInput.value.length < 6) return;
        submitNewPasswordFormButton.querySelector(".spinner-border").classList.remove("d-none");
        submitNewPasswordFormButton.classList.add("disabled");
        updatePassword(newPasswordInput.value).then(res => {
            if (res.ok) {
                toaster.success(strings.languageSpesific.new_password_is_applied);
                newPasswordInput.value = "";
                updatePasswordModal.hide();
            } else {
                utilites.handleError(res, messages.unknownError);
            }
            submitNewPasswordFormButton.querySelector(".spinner-border").classList.add("d-none");
            submitNewPasswordFormButton.classList.remove("disabled");
        });
    });
}

$(".open-update-password-modal").addEventListener("click", (e) => {
    e.preventDefault();
    initSetpasswordModal();
    updatePasswordModal.show();
});