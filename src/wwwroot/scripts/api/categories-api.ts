export function getCategories(withProducts: boolean = false): Promise<Response> {
    return fetch(withProducts ? "/api/categories/with-products" : "/api/categories");
}

export function getCategory(categoryId: string): Promise<Response> {
    return fetch("/api/categories/" + categoryId);
}

export function createCategory(name: string, disabled: boolean): Promise<Response> {
    return fetch("/api/categories/create?" + new URLSearchParams({
        name
    }));
}

export function updateCategory(categoryId: string, newName: string): Promise<Response> {
    return fetch("/api/categories/" + categoryId + "/update?" + new URLSearchParams({
        newName
    }));
}

export function deleteCategory(categoryId: string): Promise<Response> {
    return fetch("/api/categories/" + categoryId + "/delete", {
        method: "delete"
    });
}

export function enableCategory(categoryId: string): Promise<Response> {
    return fetch("/api/categories/" + categoryId + "/enable");
}

export function disableCategory(categoryId: string): Promise<Response> {
    return fetch("/api/categories/" + categoryId + "/disable");
}