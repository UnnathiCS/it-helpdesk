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
    document.getElementById('authMessage').innerText = 'All fields are required.';
    return;
  }

  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await res.json();
  document.getElementById('authMessage').innerText = data.message || data.error;

  if (data.message) {
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
  }
}

// LOGIN
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
  
    if (!email || !password) {
      document.getElementById('authMessage').innerText = 'Email and password are required.';
      return;
    }
  
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  
    const data = await res.json();
    if (data.token) {
      token = data.token;
      userRole = data.role;
      document.getElementById('authMessage').innerText = data.message;
  
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
      document.getElementById('authMessage').innerText = data.error;
    }
  }
  

// LOGOUT
function logout() {
  token = '';
  userRole = '';
  document.getElementById('authMessage').innerText = '';
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('employeePanel').style.display = 'none';
  document.getElementById('itStaffPanel').style.display = 'none';
  document.getElementById('logoutSection').style.display = 'none';
}

// CREATE TICKET
async function createTicket() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const department = document.getElementById('department').value;
  const category = document.getElementById('category').value;

  if (!title || !description) {
    alert('Please provide a title and description.');
    return;
  }

  const res = await fetch(`${BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      title, 
      description, 
      department, 
      category 
    }) // No need to send userId explicitly; backend extracts it from the token
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (data.message) {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
  }
}

// EMPLOYEE - VIEW OWN TICKETS
async function loadMyTickets() {
  try {
    const res = await fetch(`${BASE_URL}/my-tickets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.message || 'Failed to load tickets.');
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
      div.innerHTML = `
        <strong>${ticket.title}</strong><br>
        ${ticket.description}<br>
        Department: ${ticket.department}<br>
        Category: ${ticket.category}<br>
        Status: ${ticket.status}<br>
        Created At: ${new Date(ticket.createdAt).toLocaleString()}<hr>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    alert('An error occurred while loading tickets.');
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
    div.innerHTML = `
      <strong>${ticket.title}</strong> by ${ticket.createdByName}<br>
      ${ticket.description}<br>
      <select onchange="updateStatus('${ticket._id}', this.value)">
        <option ${ticket.status === 'Open' ? 'selected' : ''}>Open</option>
        <option ${ticket.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option ${ticket.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
      </select>
      <button onclick="deleteTicket('${ticket._id}')">Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
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