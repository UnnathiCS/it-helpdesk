const API_URL = "http://localhost:5000"; // Change to deployed backend URL if needed

// Create Ticket Function
async function createTicket() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const department = document.getElementById("department").value;
    const category = document.getElementById("category").value;

    const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, department, category })
    });

    const data = await response.json();
    document.getElementById("response").innerText = data.message;
    loadTickets();
}

// Load All Tickets
async function loadTickets() {
    const response = await fetch(`${API_URL}/tickets`);
    const tickets = await response.json();
    let ticketList = "";

    tickets.forEach(ticket => {
        ticketList += `
            <div class="ticket">
                <h3>${ticket.title}</h3>
                <p><strong>Department:</strong> ${ticket.department}</p>
                <p><strong>Category:</strong> ${ticket.category}</p>
                <p>${ticket.description}</p>
                <p><strong>Status:</strong> ${ticket.status}</p>
            </div>
        `;
    });

    document.getElementById("tickets-list").innerHTML = ticketList;
}

// Load Tickets on Page Load
window.onload = loadTickets;
