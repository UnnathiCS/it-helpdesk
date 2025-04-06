const BASE_URL = 'http://localhost:5000';
let token = '';
let userRole = '';

// REGISTER
async function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const role = document.getElementById('regRole').value;

  if (!name || !email || !password) {
    displayMessage('❌ All fields are required.', 'error');
    return;
  }

  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await res.json();
  if (data.message) {
    displayMessage(`🎉 Successfully registered! Welcome, ${name}.`, 'success');

    // Automatically log the user in
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const loginData = await loginRes.json();
    if (loginData.token) {
      token = loginData.token;
      userRole = loginData.role;

      // Redirect to ticket creation section
      document.getElementById('registerSection').style.display = 'none';
      document.getElementById('employeePanel').style.display = 'block';
      displayMessage(`🎉 Welcome, ${name}! You can now create a ticket.`, 'success');
    } else {
      displayMessage('❌ Error logging in after registration. Please try logging in manually.', 'error');
    }

    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
  } else {
    displayMessage(data.error || '❌ Registration failed.', 'error');
  }
}

// LOGIN
async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showDialog('❌ Email and password are required.', 'error', 'loginForm');
    return;
  }

  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token; // Set the token
    userRole = data.role; // Set the user's role
    const userName = data.name; // Get the user's name

    showDialog(`🎉 Welcome back, ${userName}!`, 'success', 'loginForm');

    // Show logout button for all roles
    document.getElementById('logoutSection').style.display = 'block';

    if (userRole === 'employee') {
      document.getElementById('employeePanel').style.display = 'block';
      document.getElementById('itStaffPanel').style.display = 'none';
    } else if (userRole === 'it_staff') {
      document.getElementById('employeePanel').style.display = 'none';
      document.getElementById('itStaffPanel').style.display = 'block';
    }
  } else {
    showDialog(data.error || '❌ Invalid credentials.', 'error', 'loginForm');
  }
}

function showDialog(message, type, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear any existing messages
  const dialog = document.createElement('div');
  dialog.className = type === 'success' ? 'dialog success' : 'dialog error';
  dialog.innerText = message;

  container.appendChild(dialog);

  setTimeout(() => {
    dialog.remove();
  }, 3000);
}

// LOGOUT
function logout() {
  token = '';
  userRole = '';

  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');

  if (loginEmail) loginEmail.value = ''; // Clear the email field if it exists
  if (loginPassword) loginPassword.value = ''; // Clear the password field if it exists

  document.getElementById('authMessage').innerText = '';
  document.getElementById('employeePanel').style.display = 'none';
  document.getElementById('itStaffPanel').style.display = 'none';
  document.getElementById('logoutSection').style.display = 'none';
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('toggleSection').style.display = 'block';
  document.getElementById('messageContainer').style.display = 'none';
  document.getElementById('ticketMessageContainer').innerHTML = ''; // Clear ticket messages
  document.getElementById('my-tickets-list').innerHTML = ''; // Clear employee tickets list
}

// CREATE TICKET
async function createTicket() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const department = document.getElementById('department').value;
  const category = document.getElementById('category').value;

  if (!title || !description) {
    showDialog('❌ Please provide a title and description.', 'error', 'ticketMessageContainer');
    return;
  }

  const res = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, department, category })
  });

  const data = await res.json();
  if (data.message) {
    showDialog('🎉 Ticket created successfully!', 'success', 'ticketMessageContainer');
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
  } else {
    showDialog(data.error || '❌ Failed to create ticket.', 'error', 'ticketMessageContainer');
  }
}

// EMPLOYEE - VIEW OWN TICKETS
async function loadMyTickets() {
  try {
    const res = await fetch(`${BASE_URL}/my-tickets`, {
      headers: { 'Authorization': `Bearer ${token}` } // Ensure the token is sent in the Authorization header
    });

    if (!res.ok) {
      const error = await res.json();
      showDialog(error.message || '❌ Failed to load tickets.', 'error', 'ticketMessageContainer');
      return;
    }

    const tickets = await res.json();
    const container = document.getElementById('my-tickets-list');
    container.innerHTML = '';

    if (tickets.length === 0) {
      container.innerHTML = '<p>No tickets found.</p>';
      return;
    }

    tickets.forEach(ticket => {
      const div = document.createElement('div');
      div.className = 'employee-ticket-card';
      const statusClass = ticket.status.toLowerCase().replace(' ', '-');
      div.innerHTML = `
        <h3>${ticket.title}</h3>
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Department:</strong> ${ticket.department}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Status:</strong> <span class="status ${statusClass}">${ticket.status}</span></p>
        <p><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
      `;
      container.appendChild(div);
    });

    // Add a refresh button
    const refreshButton = document.createElement('button');
    refreshButton.className = 'refresh-btn';
    refreshButton.innerText = 'Refresh Tickets';
    refreshButton.onclick = loadMyTickets;
    container.appendChild(refreshButton);
  } catch (error) {
    showDialog('❌ An error occurred while loading tickets.', 'error', 'ticketMessageContainer');
  }
}

// IT STAFF - VIEW ALL TICKETS
async function loadTickets() {
  const res = await fetch(`${BASE_URL}/tickets`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const tickets = await res.json();
  const container = document.getElementById('tickets-list');
  container.innerHTML = '';
  tickets.forEach(ticket => {
    const div = document.createElement('div');
    div.className = 'ticket-card';
    div.innerHTML = `
      <h3>${ticket.title}</h3>
      <p><strong>Created By:</strong> ${ticket.createdByName}</p>
      <p><strong>Description:</strong> ${ticket.description}</p>
      <p><strong>Department:</strong> ${ticket.department}</p>
      <p><strong>Category:</strong> ${ticket.category}</p>
      <p><strong>Status:</strong></p>
      <select id="status-${ticket._id}">
        <option value="Open" ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
        <option value="In Progress" ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Resolved" ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
      </select>
      <button onclick="confirmStatusUpdate('${ticket._id}')">Update Status</button>
      <button onclick="deleteTicket('${ticket._id}')">Delete</button>
    `;
    container.appendChild(div);
  });
}

async function confirmStatusUpdate(ticketId) {
  const status = document.getElementById(`status-${ticketId}`).value;
  const res = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  alert(data.message || 'Status updated successfully.');
  loadTickets();
}

// UPDATE TICKET STATUS
async function updateStatus(ticketId, status) {
  await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  loadTickets();
}

// DELETE TICKET
async function deleteTicket(ticketId) {
  await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  loadTickets();
}

// TOGGLE SECTIONS
function showRegister() {
  document.getElementById('registerSection').style.display = 'block';
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('toggleSection').style.display = 'none';
}

function showLogin() {
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('registerSection').style.display = 'none';
  document.getElementById('toggleSection').style.display = 'none';
}

// DISPLAY MESSAGE
function displayMessage(message, type) {
  const messageContainer = document.getElementById('messageContainer');
  messageContainer.innerText = message;
  messageContainer.className = type === 'success' ? 'message success' : 'message error';
  messageContainer.style.display = 'block';

  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 5000);
}