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
    localStorage.setItem('userId', data.userId);
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
      // Inside the ticket creation in loadMyTickets, add:
// Inside the ticket creation in loadMyTickets:
div.innerHTML = `
    <h3>${ticket.title}</h3>
    <p><strong>Description:</strong> ${ticket.description}</p>
    <p><strong>Department:</strong> ${ticket.department}</p>
    <p><strong>Category:</strong> ${ticket.category}</p>
    <p><strong>Status:</strong> <span class="status ${statusClass}">${ticket.status}</span></p>
    <p><strong>Created At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
    <button onclick="openChat('${ticket._id}')" class="chat-btn">
        <i class="fas fa-comments"></i> Chat with IT
    </button>
    <div id="chat-container-${ticket._id}" class="chat-container" style="display: none;">
        <div id="chat-messages-${ticket._id}" class="chat-messages"></div>
        <div class="chat-input-container">
            <input type="text" id="chat-input-${ticket._id}" class="chat-input" placeholder="Type your message...">
            <button onclick="sendChatMessage('${ticket._id}')" class="chat-btn">Send</button>
        </div>
    </div>
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
    // Inside the ticket creation in loadTickets, add:
// Inside the ticket creation in loadTickets:
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
    <button onclick="openChat('${ticket._id}')" class="chat-btn">
        <i class="fas fa-comments"></i> Chat with Employee
    </button>
    <div id="chat-container-${ticket._id}" class="chat-container" style="display: none;">
        <div id="chat-messages-${ticket._id}" class="chat-messages"></div>
        <div class="chat-input-container">
            <input type="text" id="chat-input-${ticket._id}" class="chat-input" placeholder="Type your message...">
            <button onclick="sendChatMessage('${ticket._id}')" class="chat-btn">Send</button>
        </div>
    </div>
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

// Display chatbot popup message
function showChatbotPopup() {
  const popup = document.getElementById("chatbotPopup");
  popup.innerText = "☺️ Hey, if you need any help, I'm your IT assistant!✨";
  popup.style.position = "fixed";
  popup.style.bottom = "100px";
  popup.style.right = "30px";
  popup.style.backgroundColor = "#024956";
  popup.style.color = "white";
  popup.style.padding = "10px 15px";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "1000";
  popup.style.display = "block";
  popup.style.animation = "fadeIn 1s ease-in-out";

  // Remove popup after 5 seconds
  setTimeout(() => {
    popup.style.animation = "fadeOut 1s ease-in-out";
    setTimeout(() => popup.style.display = "none", 1000);
  }, 5000);
}
// Add these functions to script.js:

// Function to open chat for a ticket
function openChat(ticketId) {
  const chatContainer = document.getElementById(`chat-container-${ticketId}`);
  if (chatContainer) {
      chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
      if (chatContainer.style.display === 'block') {
          loadChatMessages(ticketId);
      }
  }
}

// Function to load chat messages
async function loadChatMessages(ticketId) {
  try {
      const res = await fetch(`${BASE_URL}/tickets/${ticketId}/chat`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to load messages');
      
      const messages = await res.json();
      const chatBox = document.getElementById(`chat-messages-${ticketId}`);
      chatBox.innerHTML = '';
      
      messages.forEach(msg => {
          const messageDiv = document.createElement('div');
          // Determine if the message was sent by the current user
          const isCurrentUser = msg.senderId === localStorage.getItem('userId');
          messageDiv.className = `chat-message ${isCurrentUser ? 'sent' : 'received'}`;
          messageDiv.innerHTML = `
              <strong>${msg.senderName}:</strong> ${msg.message}
              <small class="message-time">${new Date(msg.createdAt).toLocaleString()}</small>
          `;
          chatBox.appendChild(messageDiv);
      });
      
      chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
      console.error('Error loading messages:', error);
      showDialog('❌ Failed to load chat messages', 'error', 'ticketMessageContainer');
  }
}
// Function to send a chat message
async function sendChatMessage(ticketId) {
  const input = document.getElementById(`chat-input-${ticketId}`);
  const message = input.value.trim();
  
  if (!message) return;
  
  try {
      const res = await fetch(`${BASE_URL}/tickets/${ticketId}/chat`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message })
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      input.value = '';
      loadChatMessages(ticketId);
  } catch (error) {
      console.error('Error sending message:', error);
  }
}
// Call the function when the page loads
window.addEventListener("load", showChatbotPopup);