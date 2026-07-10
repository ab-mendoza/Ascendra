// Authentication

const token = localStorage.getItem("token");
const fullName = localStorage.getItem("fullName");
const role = localStorage.getItem("role");

if (!token) {
    window.location.href = "login.html";
}

// Configuration

const SALES_API = `${BASE_URL}/sales`;

// DOM Elements

const form = document.getElementById("salesForm");
const ticketID = document.getElementById("ticketId");
const orderID = document.getElementById("orderId");
const initialAmount = document.getElementById("initialAmount");
const finalAmount = document.getElementById("finalAmount");
const comment = document.getElementById("comment");

const welcomeMessage = document.getElementById("welcome-message");
const productsMenu = document.getElementById("productsMenu");
const logoutButton = document.querySelector(".logoutButton");

// Initialize Page

welcomeMessage.textContent = `Welcome, ${fullName}!`;

if (role !== "Administrator") {
    productsMenu.style.display = "none";
}

// Event Listeners

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const salesData = {
        ticketId: Number(ticketID.value),
        orderId: Number(orderID.value),
        initialAmount: Number(initialAmount.value),
        finalAmount: Number(finalAmount.value),
        comment: comment.value
    };

    try {

        const response = await fetch(SALES_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(salesData)

        });

        if (!response.ok) {

            if (response.status === 401) {
                throw new Error("Your session has expired. Please sign in again.");
            }

            const error = await response.text();

            throw new Error(error || "An unexpected error occurred.");

        }

        alert("Sale saved successfully!");

        form.reset();

    }
    catch (error) {

        alert(error.message);

    }

});

logoutButton.addEventListener("click", function () {

    localStorage.clear();

    window.location.href = "login.html";

});