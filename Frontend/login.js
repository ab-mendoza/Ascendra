const LOGIN_API = `${BASE_URL}/auth/login`;

const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const loginData = {
        username: document.getElementById("userName").value,
        password: document.getElementById("password").value
    };

    try {

        const response = await fetch(LOGIN_API, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(loginData)

        });

        if (!response.ok) {

            const error = await response.json();

            throw new Error(error.message || "An unexpected error occurred.");
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