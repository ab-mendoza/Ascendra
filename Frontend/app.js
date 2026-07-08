const API = "http://localhost:5130/sales";

const form = document.getElementById("salesForm");
const ticketID = document.getElementById("ticketId");
const orderID = document.getElementById("orderId");
const initialAmount = document.getElementById("initialAmount");
const finalAmount = document.getElementById("finalAmount");
const comment = document.getElementById("comment");

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
        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(salesData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        alert("Sale saved successfully!");
        form.reset();

    } catch (error) {
        alert(error.message);
    }
});