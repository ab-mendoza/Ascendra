const API = "http://localhost:5130/auth/login";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const loginData = {
        username: document.getElementById("userName").value,
        password: document.getElementById("password").value
    };

    try {

        const response = await fetch(API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(loginData)

        });

        if (!response.ok) {

            if (response.status === 401) {
                throw new Error("Your session has expired. Please sign in again.");
            }

            const error = await response.text();

            throw new Error(error || "An unexpected error occurred.");

        }

        const result = await response.json();

        // Save user information
        localStorage.setItem("token", result.token);
        localStorage.setItem("fullName", result.fullName);
        localStorage.setItem("role", result.role);

        // Redirect to the sales page
        window.location.href = "sales.html";

    }
    catch (error) {

        alert(error.message);

    }

});