// Build the login endpoint URL from the configured base API URL.
const LOGIN_API = `${BASE_URL}/auth/login`;

// Get the login form element from the page.
const form = document.getElementById("loginForm");

// Handle the form submission.
form.addEventListener("submit", async function (event) {

    // Prevent the browser from submitting the form normally.
    event.preventDefault();

    // Collect the username and password entered by the user.
    const loginData = {
        username: document.getElementById("userName").value,
        password: document.getElementById("password").value
    };

    try {

        // Send the login credentials to the API.
        const response = await fetch(LOGIN_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(loginData)

        });

        // If the API returns an error response, extract and throw its message.
        if (!response.ok) {

            const error = await response.json();

            throw new Error(error.message || "An unexpected error occurred.");
        }

        // Parse the successful login response.
        const result = await response.json();

        // Save user information
        localStorage.setItem("token", result.token);
        localStorage.setItem("fullName", result.fullName);
        localStorage.setItem("role", result.role);

        // Redirect to the sales page
        window.location.href = "sales.html";

    }
    catch (error) {

        // Show any login or network error to the user.
        alert(error.message);

    }

});