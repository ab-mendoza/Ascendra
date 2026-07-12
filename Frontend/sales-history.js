const token = localStorage.getItem("token");
const fullName = localStorage.getItem("fullName");
const role = localStorage.getItem("role");

if (!token) {
    window.location.href = "login.html";
}

const SALES_API = `${BASE_URL}/sales`;
const PAGE_SIZE = 10;

const welcomeMessage = document.getElementById("welcome-message");
const productsMenu = document.getElementById("productsMenu");
const logoutButton = document.querySelector(".logoutButton");
const filtersForm = document.getElementById("salesHistoryFilters");
const searchInput = document.getElementById("salesSearch");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const tableBody = document.getElementById("salesHistoryBody");
const stateMessage = document.getElementById("salesHistoryState");
const emptyMessage = document.getElementById("salesHistoryEmpty");
const footer = document.getElementById("salesHistoryFooter");
const summary = document.getElementById("salesHistorySummary");
const pagination = document.getElementById("salesHistoryPagination");
const sortButtons = document.querySelectorAll(".sortButton");

let sales = [];
let currentPage = 1;
let sortKey = "createdAt";
let sortDirection = "descending";

welcomeMessage.textContent = `Welcome, ${fullName}!`;

if (role !== "Administrator") {
    productsMenu.style.display = "none";
}

// Update the status message above the table.  
function showState(message, type = "") {
    stateMessage.textContent = message;
    // Updates the class name to include the type of message (e.g., "error", "loading") for styling purposes.
    stateMessage.className = `salesHistoryState ${type}`.trim();
    stateMessage.hidden = !message;
}

// Extracts the date from a sale object and formats it as a string in "YYYY-MM-DD" format.
function getSaleDate(sale) {
    return String(sale.createdAt || "").slice(0, 10);
}

// Formats a date value into a human-readable string using the user's locale settings.
function formatDate(value) {
    // Create a Date object from the input value.
    const date = new Date(value);
    // Check if the date is valid. If not, return a placeholder.
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    // Use Intl.DateTimeFormat to format the date according to the user's locale.
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}

// Formats a numeric value as a currency string in USD format.
function formatAmount(value) {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return "-";
    }

    return amount.toLocaleString(undefined, {
        style: "currency",
        currency: "USD"
    });
}

// Returns a new array containing only the sales that match the provided filters.
function getFilteredSales() {

    const searchTerm = searchInput.value.trim().toLowerCase();
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;

    // Filter the sales based on the search term and date range.
    return sales.filter(function (sale) {
        const saleDate = getSaleDate(sale);
        const searchableText = [
            sale.ticketId,
            sale.orderId,
            sale.agent,
            sale.comment
        ]
        .filter(Boolean)
        .join(" ").
        toLowerCase();

        // Check if the sale matches the search term and date range.
        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
        const matchesFromDate = !dateFrom || saleDate >= dateFrom;
        const matchesToDate = !dateTo || saleDate <= dateTo;

        return matchesSearch && matchesFromDate && matchesToDate;
    });
}
// Sorts the sales array based on the current sort key and direction.
// ...: spread operator.
// ?? "": nullish coalescing operator.
function sortSales(salesToSort) {
    return [...salesToSort].sort(function (firstSale, secondSale) {
        const firstValue = firstSale[sortKey] ?? "";
        const secondValue = secondSale[sortKey] ?? "";
        let comparison;

        if (typeof firstValue === "string" || typeof secondValue === "string") {
            comparison = String(firstValue).localeCompare(String(secondValue), undefined, {
                numeric: true,
                sensitivity: "base"
            });
        }
        else {
            comparison = Number(firstValue) - Number(secondValue);
        }

        return sortDirection === "ascending" ? comparison : -comparison;
    });
}

// Creates a cell and assigns the given value.
function createCell(value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = value;

    if (className) {
        cell.className = className;
    }

    return cell;
}

// Iterates over each sales in the array, gets the values and appends them into the created row.
function renderRows(pageSales) {
    tableBody.replaceChildren();

    pageSales.forEach(function (sale) {
        const row = document.createElement("tr");

        row.append(
            createCell(String(sale.ticketId ?? "-")),
            createCell(String(sale.orderId ?? "-")),
            createCell(sale.agent || "-"),
            createCell(formatDate(sale.createdAt)),
            createCell(formatAmount(sale.initialAmount), "numericValue"),
            createCell(formatAmount(sale.finalAmount), "numericValue"),
            createCell(sale.comment || "-", "commentValue")
        );

        tableBody.append(row);
    });
}

function createPaginationButton(label, page, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;

    if (page === currentPage) {
        button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", function () {
        currentPage = page;
        renderSalesHistory();
    });

    return button;
}

function addPageButton(page) {
    pagination.append(createPaginationButton(String(page), page));
}

function addEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    ellipsis.setAttribute("aria-hidden", "true");
    pagination.append(ellipsis);
}

function renderPagination(totalPages) {
    pagination.replaceChildren();
    pagination.append(createPaginationButton("Previous", currentPage - 1, currentPage === 1));

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const visiblePages = [...pages]
        .filter(function (page) {
            return page >= 1 && page <= totalPages;
        })
        .sort(function (firstPage, secondPage) {
            return firstPage - secondPage;
        });

    let previousPage = 0;

    visiblePages.forEach(function (page) {
        if (page - previousPage > 1) {
            addEllipsis();
        }

        addPageButton(page);
        previousPage = page;
    });

    pagination.append(createPaginationButton("Next", currentPage + 1, currentPage === totalPages));
}

function updateSortButtons() {
    sortButtons.forEach(function (button) {
        const column = button.closest("th");
        const isCurrentSort = button.dataset.sortKey === sortKey;

        button.classList.toggle("isSorted", isCurrentSort);
        column.setAttribute("aria-sort", isCurrentSort ? sortDirection : "none");
        button.setAttribute(
            "aria-label",
            isCurrentSort
                ? `Sorted ${sortDirection} by ${button.textContent}`
                : `Sort by ${button.textContent}`
        );
    });
}

function renderSalesHistory() {
    const filteredSales = sortSales(getFilteredSales());
    const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);

    const firstRecord = (currentPage - 1) * PAGE_SIZE;
    const pageSales = filteredSales.slice(firstRecord, firstRecord + PAGE_SIZE);

    renderRows(pageSales);
    emptyMessage.hidden = filteredSales.length !== 0;
    footer.hidden = filteredSales.length === 0;

    if (filteredSales.length > 0) {
        const lastRecord = firstRecord + pageSales.length;
        summary.textContent = `Showing ${firstRecord + 1}-${lastRecord} of ${filteredSales.length} sales`;
        renderPagination(totalPages);
    }

    updateSortButtons();
}

async function loadSales() {
    showState("Loading sales...");

    try {
        const response = await fetch(SALES_API, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }

            const error = await response.text();
            throw new Error(error || "Unable to load sales history.");
        }

        const result = await response.json();

        if (!Array.isArray(result)) {
            throw new Error("The sales service returned an invalid response.");
        }

        sales = result;
        showState("");
        renderSalesHistory();
    }
    catch (error) {
        tableBody.replaceChildren();
        emptyMessage.hidden = true;
        footer.hidden = true;
        showState(error.message, "error");
    }
}

filtersForm.addEventListener("submit", function (event) {
    event.preventDefault();
});

searchInput.addEventListener("input", function () {
    currentPage = 1;
    renderSalesHistory();
});

dateFromInput.addEventListener("change", function () {
    currentPage = 1;
    renderSalesHistory();
});

dateToInput.addEventListener("change", function () {
    currentPage = 1;
    renderSalesHistory();
});

sortButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const selectedKey = button.dataset.sortKey;

        if (sortKey === selectedKey) {
            sortDirection = sortDirection === "ascending" ? "descending" : "ascending";
        }
        else {
            sortKey = selectedKey;
            sortDirection = "ascending";
        }

        currentPage = 1;
        renderSalesHistory();
    });
});

logoutButton.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "/";
});

loadSales();