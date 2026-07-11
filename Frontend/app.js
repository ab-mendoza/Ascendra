// Authentication

// Retrieve the saved authentication and user information from local storage.
const token = localStorage.getItem("token");
const fullName = localStorage.getItem("fullName");
const role = localStorage.getItem("role");

// If there is no token, the user is not authenticated and must log in.
if (!token) {
    window.location.href = "login.html";
}

// Configuration

// Build the sales API endpoint URL from the configured base API URL.
const SALES_API = `${BASE_URL}/sales`;

// DOM Elements

// Get the sales form and its input fields from the page.
const form = document.getElementById("salesForm");
const ticketID = document.getElementById("ticketId");
const orderID = document.getElementById("orderId");
const initialAmount = document.getElementById("initialAmount");
const finalAmount = document.getElementById("finalAmount");
const comment = document.getElementById("comment");

// Get page elements used for user display, navigation, and logout.
const welcomeMessage = document.getElementById("welcome-message");
const productsMenu = document.getElementById("productsMenu");
const logoutButton = document.querySelector(".logoutButton");

// Initialize Page

// Display a personalized welcome message using the saved user's full name.
welcomeMessage.textContent = `Welcome, ${fullName}!`;

// Hide the products menu for users who are not administrators.
if (role !== "Administrator") {
    productsMenu.style.display = "none";
}

// Event Listeners

// Handle the sales form submission.
form.addEventListener("submit", async function (event) {

    // Prevent the browser from reloading the page when the form is submitted.
    event.preventDefault();

    // Collect and format the sales data from the form fields.
    const salesData = {
        ticketId: Number(ticketID.value),
        orderId: Number(orderID.value),
        initialAmount: Number(initialAmount.value),
        finalAmount: Number(finalAmount.value),
        comment: comment.value
    };

    try {

        // Send the sale data to the API.
        const response = await fetch(SALES_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(salesData)

        });

        // Handle failed API responses.
        if (!response.ok) {

            // If the token is invalid or expired, ask the user to sign in again.
            if (response.status === 401) {
                throw new Error("Your session has expired. Please sign in again.");
            }

            // Read the error response from the API and show it to the user.
            const error = await response.text();

            throw new Error(error || "An unexpected error occurred.");

        }

        // Notify the user that the sale was saved.
        alert("Sale saved successfully!");

        // Clear the form fields after a successful save.
        form.reset();

    }
    catch (error) {

        // Show any request, authentication, or validation error to the user.
        alert(error.message);

    }

});

// Handle the logout button click.
logoutButton.addEventListener("click", function () {

    // Remove all saved user/session data from local storage.
    localStorage.clear();

    // Redirect the user to the home page.
    window.location.href = "/";

});