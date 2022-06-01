import * as JsSearch from "js-search";

interface GridProps {
    id?: string;
    debug?: boolean;
    data: Array<Object>;
    columns: Array<GridColumn>;
    pageSize?: number;
    search?: SearchConfiguration;
    classes?: GridClasses
    strings?: GridStrings
}

interface GridConfiguration {
    id: string;
    debug: boolean;
    data: Array<Object>;
    columns: Array<GridColumn>;
    pageSize: number;
    search: SearchConfiguration;
    classes: GridClasses,
    strings: GridStrings
}

interface GridStrings {
    previousPage: string,
    nextPage: string,
    search: string
}

interface GridClasses {
    table: string,
    thead: string
}

interface SearchConfiguration {
    dataIds: Array<string | Array<string>>;
}

interface GridColumn {
    dataId?: string | Array<string>;
    columnName: string | Function;
    cellValue?: string | Function | Element;
    width?: string;
    maxWidth?: string;
    minWidth?: string;
    className?: string;
    click?: Function
}

export default class Grid {
    private readonly canRender: boolean;
    private readonly defaultOptions: GridConfiguration = {
        id: "id",
        debug: false,
        columns: [],
        data: [],
        pageSize: 0,
        classes: {
            table: "table",
            thead: "table-light"
        },
        search: {
            dataIds: [],
        },
        strings: {
            nextPage: "Neste",
            previousPage: "Forrige",
            search: "Søk"
        }
    };
    private configuration: GridConfiguration;
    private domElement: Element;
    private searchIndex: JsSearch.Search;
    public currentPage: number = 0;

    constructor(props: GridProps) {
        this.setOptions(props);
        this.validateOptions();
        this.canRender = true;
    }

    private setOptions(props: GridProps = this.defaultOptions): void {
        this.configuration = {} as GridConfiguration;
        this.configuration.columns = [];
        for (const column of props.columns) {
            if (isGridColumn(column)) {
                this.configuration.columns.push(column);
            } else {
                this.log("column is not of type GridColumn: " + JSON.stringify(column));
            }
        }
        this.configuration.data = props.data ?? this.defaultOptions.data;
        this.configuration.id = props.id ?? this.defaultOptions.id;
        this.configuration.debug = props.debug ?? this.defaultOptions.debug;
        this.configuration.pageSize = props.pageSize ?? this.defaultOptions.pageSize;
        this.configuration.classes = props.classes ?? this.defaultOptions.classes;
        this.configuration.search = props.search ?? this.defaultOptions.search;
        this.configuration.strings = props.strings ?? this.defaultOptions.strings;
    }

    private validateOptions(): void {
        if (this.configuration.data.length === undefined) {
            throw new GridError("props.data.length is undefined");
        }
        if (this.configuration.columns.length === undefined || this.configuration.columns.length <= 0) {
            throw new GridError("props.columns.length is undefined or <= 0");
        }
    }

    private renderCurrentPageIndicator(): void {
        if (this.configuration.pageSize <= 0) return;
        this.domElement.querySelectorAll(".pagination .page-item").forEach((el) => {
            if (el.getAttribute("data-page-number") == this.currentPage.toString()) el.classList.add("active");
            else el.classList.remove("active");
        });
    }

    private renderPaginator(): void {
        this.log("start renderPaginator");
        if (this.configuration.pageSize <= 0 || this.configuration.data.length < this.configuration.pageSize) return;
        const nav = document.createElement("nav");
        nav.className = "float-right user-select-none";
        const ul = document.createElement("ul");
        ul.className = "pagination";
        const previousItem = document.createElement("li");
        previousItem.className = "page-item";
        previousItem.onclick = () => this.navigate(this.currentPage - 1);
        const previousLink = document.createElement("span");
        previousLink.style.cursor = "pointer";
        previousLink.className = "page-link";
        previousLink.innerText = this.configuration.strings.previousPage;
        previousItem.appendChild(previousLink);
        ul.appendChild(previousItem);

        for (let i = 0; i < this.configuration.data.length / this.configuration.pageSize; i++) {
            const item = document.createElement("li");
            item.className = "page-item";
            item.dataset.pageNumber = i.toString();
            item.onclick = () => this.navigate(i);
            const link = document.createElement("span");
            link.className = "page-link";
            link.style.cursor = "pointer";
            link.innerText = (i + 1).toString();
            item.appendChild(link);
            ul.appendChild(item);
        }

        const nextItem = document.createElement("li");
        nextItem.className = "page-item";
        nextItem.onclick = () => this.navigate(this.currentPage + 1);
        const nextLink = document.createElement("span");
        nextLink.style.cursor = "pointer";
        nextLink.className = "page-link";
        nextLink.innerText = this.configuration.strings.nextPage;
        nextItem.appendChild(nextLink);

        ul.appendChild(nextItem);
        nav.appendChild(ul);
        this.domElement.appendChild(nav);
        this.log("end renderPaginator");
    }

    private renderWrapper(): void {
        const wrapper = document.createElement("div");
        wrapper.className = "table-responsive";
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        table.className = this.configuration.classes.table;
        thead.className = this.configuration.classes.thead;
        table.appendChild(thead);
        table.appendChild(tbody);
        wrapper.appendChild(table);
        this.domElement.appendChild(wrapper);
    }

    private renderHead(): void {
        const wrapper = this.domElement.querySelector("table thead");
        wrapper.innerHTML = "";
        const row = document.createElement("tr");
        for (const col of this.configuration.columns) {
            const th = document.createElement("th");
            th.innerText = this.asString(col.columnName);
            row.appendChild(th);
        }
        wrapper.appendChild(row);
    }

    // https://github.com/bvaughn/js-search/blob/master/source/getNestedFieldValue.js
    private getNestedFieldValue<T>(object: Object, path: Array<string>): T {
        path = path || [];
        object = object || {};

        let value = object;

        // walk down the property path
        for (let i = 0; i < path.length; i++) {
            value = value[path[i]];
            if (value == null) {
                return null;
            }
        }

        return value as T;
    }

    private renderBody(data: Array<Object> = null, isSearchResult: boolean = false): void {
        let wrapper: Element;
        if (isSearchResult) {
            this.domElement.querySelector("table tbody:not(.search-results)").classList.add("d-none");
            this.domElement.querySelector("table tbody.search-results").classList.remove("d-none");
            wrapper = this.domElement.querySelector("table tbody.search-results");
        } else {
            this.domElement.querySelector("table tbody.search-results")?.classList.add("d-none");
            this.domElement.querySelector("table tbody:not(.search-results)").classList.remove("d-none");
            wrapper = this.domElement.querySelector("table tbody:not(.search-results)");
        }
        wrapper.innerHTML = "";
        let items = data ?? this.configuration.data;
        if (this.configuration.pageSize > 0) {
            items = items.slice(0, this.configuration.pageSize);
        }
        for (const item of items) {
            const row = document.createElement("tr");
            // @ts-ignore
            row.dataset.id = item[this.configuration.id];
            for (const val of this.configuration.columns) {
                const cell = document.createElement("td");
                cell.className = "text-break";
                if (val.width) cell.style.width = val.width;
                if (val.maxWidth) cell.style.maxWidth = val.maxWidth;
                if (val.minWidth) cell.style.minWidth = val.minWidth;

                if (val.click instanceof Function) cell.onclick = () => val.click(item);
                if (val.className) {
                    this.log(val.className)
                    val.className.split(" ").forEach(className => {
                        cell.classList.add(className)
                    })
                }
                if (val.cellValue instanceof Function) {
                    const computed = val.cellValue(item);
                    if (computed instanceof Element) cell.appendChild(computed);
                    else if (typeof computed === "string" || typeof computed === "number") cell.innerText = computed as string;
                } else if (Array.isArray(val.dataId)) {
                    cell.innerText = this.getNestedFieldValue(item, val.dataId);
                } else if (typeof val.dataId === "string" && val.dataId.length > 0) {
                    cell.innerText = item[val.dataId];
                } else if (typeof val.cellValue === "string" || typeof val.cellValue === "number") {
                    cell.innerText = val.cellValue;
                } else if (val.cellValue instanceof Element) {
                    cell.appendChild(val.cellValue);
                }
                row.appendChild(cell);
            }
            wrapper.appendChild(row);
        }
    }

    private asString(val: string | Function, callbackData: any = undefined) {
        if (val instanceof Function) {
            return val(callbackData);
        } else {
            return val;
        }
    }

    private static id(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    private log(message: any): void {
        if (!this.configuration.debug) return;
        console.log("Grid Debug: " + message);
    }

    private renderSearch() {
        if (this.configuration.search.dataIds.length < 1) return;
        const wrapper = document.createElement("div");
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.className = "form-control";
        searchInput.placeholder = this.configuration.strings.search;
        searchInput.oninput = () => this.search(searchInput.value);
        wrapper.appendChild(searchInput);
        this.domElement.appendChild(wrapper);
    }

    private renderSearchResultWrapper() {
        if (this.configuration.search.dataIds.length < 1) return;
        const searchWrapper = document.createElement("tbody");
        searchWrapper.className = "search-results";
        this.domElement.querySelector("table").appendChild(searchWrapper);
    }

    private populateSearchIndex() {
        if (this.configuration.search.dataIds.length < 1) return;
        this.searchIndex = new JsSearch.Search(this.configuration.id);
        this.searchIndex.indexStrategy = new JsSearch.PrefixIndexStrategy();
        this.configuration.search.dataIds.forEach((id) => this.searchIndex.addIndex(id));
        this.searchIndex.addDocuments(this.configuration.data);
    }

    public search(query: string): void {
        if (this.configuration.search.dataIds.length < 1) return;
        let result = this.searchIndex.search(query);
        if (result.length === 0) {
            this.renderBody(this.configuration.data);
        } else {
            this.renderBody(result, true);
        }
    }

    public navigate(pageNumber: number): void {
        const maxPage = Math.ceil(this.configuration.data.length / this.configuration.pageSize - 1);
        if (this.configuration.pageSize <= 0 || pageNumber < 0 || pageNumber === this.currentPage || pageNumber > maxPage) return;
        this.log("Navigating to page: " + pageNumber);
        const skipCount = this.configuration.pageSize * pageNumber;
        const endIndex =
            this.configuration.data.length < skipCount + this.configuration.pageSize
                ? this.configuration.data.length
                : skipCount + this.configuration.pageSize;
        this.renderBody(this.configuration.data.slice(skipCount, endIndex));
        this.currentPage = pageNumber;
        this.renderCurrentPageIndicator();
    }

    public removeByID(id: string): void {
        // @ts-ignore
        const itemIndex = this.configuration.data.findIndex((c) => c[this.configuration.id] === id);
        if (itemIndex !== -1) {
            delete this.configuration.data[itemIndex];
            this.domElement.querySelector(`tr[data-id="${id}"]`).remove();
        } else {
            this.log("Grid does not contain id: " + id);
        }
    }

    public refresh(data?: Array<Object>) {
        this.renderPaginator();
        this.navigate(0);
        if (data !== undefined) this.configuration.data = data;
        this.renderBody();
        this.populateSearchIndex();
    }

    public render(el: Element): void {
        if (this.canRender) {
            this.log("Grid starting render");
            this.domElement = el;
            this.renderSearch();
            this.populateSearchIndex();
            this.renderWrapper();
            this.renderHead();
            this.renderBody();
            this.renderPaginator();
            this.renderCurrentPageIndicator();
            this.renderSearchResultWrapper();
            this.log("Grid was rendered");
        } else {
            throw new GridError("render is not allowed due to invalid props");
        }
    }
}

class GridError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GridError";
    }
}

function isArrayOfGridColumn(array: Array<GridColumn> | Array<string>): array is Array<GridColumn> {
    try {
        // @ts-ignore
        return !(array.map((element) => "name" in element).indexOf(false) !== -1);
    } catch (e) {
        return false;
    }
}

function isGridColumn(val: GridColumn | string): val is GridColumn {
    try {
        // @ts-ignore
        return "columnName" in val && ("cellValue" in val || "dataId" in val);
    } catch (e) {
        return false;
    }
}
