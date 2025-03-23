const API_URL = "http://localhost:5000";

// Register Function
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const role = document.getElementById("regRole").value;

    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    document.getElementById("authMessage").innerText = data.message || data.error;
}

// Login Function
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        document.getElementById("authMessage").innerText = "✅ Login Successful";
        checkAccess();
    } else {
        document.getElementById("authMessage").innerText = data.error;
    }
}

// Fix: Show Create Ticket for Employees
function checkAccess() {
    const role = localStorage.getItem("role");
    if (role === "it_staff") {
        document.getElementById("itStaffPanel").style.display = "block";
    } else {
        document.getElementById("employeePanel").style.display = "block"; // Employees can now see Create Ticket
    }
}

// Create Ticket for Employees
async function createTicket() {
    const token = localStorage.getItem("token");

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const department = document.getElementById("department").value;
    const category = document.getElementById("category").value;

    const response = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, description, department, category })
    });

    const data = await response.json();
    alert(data.message);
    loadMyTickets();
}

// Load Employee's Own Tickets
async function loadMyTickets() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
    });

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

    document.getElementById("my-tickets-list").innerHTML = ticketList;
}

// Load All Tickets for IT Staff
async function loadTickets() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
    });

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
                <select onchange="updateTicket('${ticket._id}', this.value)">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
                <button onclick="deleteTicket('${ticket._id}')">Delete</button>
            </div>
        `;
    });

    document.getElementById("tickets-list").innerHTML = ticketList;
}

// Update Ticket Status (IT Staff)
async function updateTicket(ticketId, status) {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
    });

    loadTickets();
}

// Delete Ticket (IT Staff)
async function deleteTicket(ticketId) {
    const token = localStorage.getItem("token");

    await fetch(`${API_URL}/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    loadTickets();
}
