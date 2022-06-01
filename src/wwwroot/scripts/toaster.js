import Toast from "bootstrap/js/dist/toast";

export class Toaster {
    constructor(options) {
        if (!options) {
            options = {hideAfter: 3500, position: "top-right"};
        }
        this.root = document.createElement("div");
        this.root.id = "toaster-container";
        switch (options.position) {
            case"top-right":
                this.root.style = "display: flex; align-items: end; flex-direction: column; position: absolute; top: 0; right: 0; padding: 15px; z-index: 9999;";
                break;
            case"top-left":
                this.root.style = "position: absolute; top: 0; padding: 15px; z-index: 9999;";
                break;
            case"bottom-right":
                this.root.style = "display: flex; align-items: end; flex-direction: column; position: absolute; bottom: 0; right: 0; padding: 15px; z-index: 9999;";
                break;
            case"bottom-left":
                this.root.style = "position: absolute; bottom: 0; padding: 15px; z-index: 9999;";
                break;
            default:
                this.root.style = "display: flex; align-items: end; flex-direction: column; position: absolute; top: 0; right: 0; padding: 15px; z-index: 9999;";
                break;
        }
        document.body.appendChild(this.root);
        this.defaultTimeout = options.hideAfter ? options.hideAfter : 3500;
        this.toastTypes = {error: "error", success: "success", info: "info"};
    }

    display(title, message, autohide, type) {
        if (!title || typeof title !== "string" || typeof message !== "string") {
            throw new Error("Toaster: title &| message is empty or not a string");
        }
        let toast = document.createElement("div");
        toast.className = "toast";
        toast.role = "alert";
        toast.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        let toastHeader = document.createElement("div");
        toastHeader.className = "toast-header";
        let toastTypeIndicator = document.createElement("div");
        switch (type) {
            case this.toastTypes.error:
                toastTypeIndicator.className = "toast-type-indicator rounded me-2 bg-danger";
                toast.style = "width: max-content; min-width: 300px; border-color: var(--bs-danger);";
                break;
            case this.toastTypes.success:
                toastTypeIndicator.className = "toast-type-indicator rounded me-2 bg-success";
                toast.style = "width: max-content; min-width: 300px; border-color: var(--bs-success);";
                break;
            case this.toastTypes.info:
                toastTypeIndicator.className = "toast-type-indicator rounded me-2 bg-info";
                toast.style = "width: max-content; min-width: 300px; border-color: var(--bs-info);";
                break;
        }
        toastTypeIndicator.style = "width: 18px; height: 18px;";
        toastHeader.appendChild(toastTypeIndicator);
        let toastTitle = document.createElement("strong");
        toastTitle.className = "me-auto text-truncate";
        toastTitle.innerText = title;
        toastHeader.appendChild(toastTitle);
        let toastCloseButton = document.createElement("button");
        toastCloseButton.className = "ms-2 mb-1 close";
        toastCloseButton.setAttribute("data-bs-dismiss","toast");
        toastCloseButton.onclick = () => {
            setTimeout(() => {
                toast.parentNode.removeChild(toast);
            }, parseInt(1e3));
        };
        if (!autohide) {
            let toastCloseButtonIcon = document.createElement("img");
            toastCloseButtonIcon.src = "data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1em\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M14 1H2a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1zM2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2z\" clip-rule=\"evenodd\"/><path fill-rule=\"evenodd\" d=\"M11.854 4.146a.5.5 0 010 .708l-7 7a.5.5 0 01-.708-.708l7-7a.5.5 0 01.708 0z\" clip-rule=\"evenodd\"/><path fill-rule=\"evenodd\" d=\"M4.146 4.146a.5.5 0 000 .708l7 7a.5.5 0 00.708-.708l-7-7a.5.5 0 00-.708 0z\" clip-rule=\"evenodd\"/></svg>";
            toastCloseButtonIcon.alt = "x";
            toastCloseButtonIcon.dataset.ariaHidden = "true";
            toastCloseButton.appendChild(toastCloseButtonIcon);
            toastHeader.appendChild(toastCloseButton);
        }
        toast.appendChild(toastHeader);
        if (message) {
            let toastBody = document.createElement("div");
            toastBody.className = "toast-body";
            toastBody.style = "word-wrap: break-word;";
            toastBody.innerText = message;
            toast.appendChild(toastBody);
        }
        this.root.appendChild(toast);
        let delay = 0;
        if (typeof autohide === "number" && autohide !== 0) {
            delay = autohide;
            autohide = true;
        } else if (autohide) {
            delay = this.defaultTimeout;
        }
        new Toast(document.getElementById(toast.id), {
            animation: true,
            autohide: autohide,
            delay: delay
        }).show();
        if (delay) setTimeout(() => {
            toast.parentNode.removeChild(toast);
        }, parseInt(delay + 1e3));
    }

    error(title, message = "", autohide = true) {
        this.display(title, message, autohide, this.toastTypes.error);
    }

    errorObj(props) {
        if (props.autohide === undefined) props.autohide = true;
        this.display(props.title, props.message, props.autohide, this.toastTypes.error);
    }

    success(title, message = "", autohide = true) {
        this.display(title, message, autohide, this.toastTypes.success);
    }

    successObj(props) {
        if (props.autohide === undefined) props.autohide = true;
        this.display(props.title, props.message, props.autohide, this.toastTypes.success);
    }

    info(title, message = "", autohide = true) {
        this.display(title, message, autohide, this.toastTypes.info);
    }

    infoObj(props) {
        if (props.autohide === undefined) props.autohide = true;
        this.display(props.title, props.message, props.autohide, this.toastTypes.info);
    }
}