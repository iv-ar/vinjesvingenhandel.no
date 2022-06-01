export function initTabs() {
    let firstActiveIsShown = false;
    document.querySelectorAll(".tab-content-container[data-tab]").forEach(contentContainer => {
        if (contentContainer.classList.contains("active") && !firstActiveIsShown) {
            firstActiveIsShown = true;
            return;
        }
        contentContainer.style.display = "none";
    });

    document.querySelectorAll(".tab-button[data-tab]").forEach(button => {
        button.addEventListener("click", handleButtonClick);
    });

    function handleButtonClick(element) {
        if (element.originalTarget.dataset.tab) {
            document.querySelectorAll(".tab-button[data-tab]").forEach(b => {
                if (b.dataset.tab === element.originalTarget.dataset.tab)
                    b.classList.add("active");
                else
                    b.classList.remove("active");
            });
            document.querySelectorAll(".tab-content-container[data-tab]").forEach(c => {
                if (c.dataset.tab === element.originalTarget.dataset.tab)
                    c.style.display = "";
                else
                    c.style.display = "none";
            });
        }
    }
}