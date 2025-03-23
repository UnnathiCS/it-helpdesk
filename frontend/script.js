const API_URL = "http://localhost:5000";

// Create Ticket
function createTicket() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
    })
    .then(response => response.json())
    .then(() => {
        alert("✅ Ticket Created!");
        loadTickets();
    })
    .catch(error => console.error("Error:", error));
}

// Load All Tickets
function loadTickets() {
    fetch(`${API_URL}/tickets`)
    .then(response => response.json())
    .then(tickets => {
        let ticketList = "";
        tickets.forEach(ticket => {
            ticketList += `
                <div class="ticket">
                    <h3>${ticket.title}</h3>
                    <p>${ticket.description}</p>
                    <p>Status: ${ticket.status}</p>
                    <button onclick="updateTicket('${ticket._id}')">Mark as Closed</button>
                    <button onclick="deleteTicket('${ticket._id}')">Delete</button>
                </div>
            `;
        });
        document.getElementById("tickets-list").innerHTML = ticketList;
    })
    .catch(error => console.error("Error:", error));
}

// Update Ticket Status
function updateTicket(id) {
    fetch(`${API_URL}/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Closed" })
    })
    .then(() => loadTickets())
    .catch(error => console.error("Error:", error));
}

// Delete Ticket
function deleteTicket(id) {
    fetch(`${API_URL}/tickets/${id}`, { method: "DELETE" })
    .then(() => loadTickets())
    .catch(error => console.error("Error:", error));
}

// Load Tickets on Page Load
window.onload = loadTickets;
    
    // The script.js file contains the JavaScript code to interact with the API. The createTicket() function sends a POST request to the API to create a new ticket. 
    // The loadTickets() function sends a GET request to the API to fetch all tickets and display them on the
    //  page. The updateTicket() function sends a PUT request to the API to update the status of a ticket to
    //  "Closed". The deleteTicket() function sends a DELETE request to the API to delete a ticket. 
    // Step 6: Run the Application 
    // To run the application, navigate to the frontend directory and start the development server
    // using the following command: 
    // cd frontend