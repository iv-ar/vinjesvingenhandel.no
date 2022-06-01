import {configuration} from "./configuration";
import {doc} from "./base";

export function getCounterControl(options = configuration.defaultParameters.counterControlOptions) {
	const wrapper = doc.createElement("div");
	wrapper.className = "number-input";

	const count = doc.createElement("input");
	count.inputMode = "numeric";
	count.type = "number";
	if (options.min !== undefined) {
		count.min = options.min;
	}
	if (options.max !== undefined) {
		count.max = options.max;
	}
	if (options.initialCount !== undefined) {
		count.value = options.initialCount;
	}
	if (options.onChange !== undefined && typeof options.onChange === "function") {
		count.addEventListener("change", (e) => {
			options.onChange(e);
		});
	}

	const minus = doc.createElement("button");
	minus.innerHTML = "&#45;";
	minus.onclick = (e) => {
		count.stepDown();
		count.dispatchEvent(new Event("change"));
	};

	const plus = doc.createElement("button");
	plus.innerHTML = "&#43;";
	plus.onclick = (e) => {
		count.stepUp();
		count.dispatchEvent(new Event("change"));
	};

	wrapper.appendChild(minus);
	wrapper.appendChild(count);
	wrapper.appendChild(plus);
	return wrapper;
}

export function getSpinner() {
	return `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Laster...</span></div>`;
}
