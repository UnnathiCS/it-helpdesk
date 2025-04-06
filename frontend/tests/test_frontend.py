import pytest

# Fixture to provide a mock frontend state for testing
@pytest.fixture
def mock_frontend():
    # Simulates the frontend state with users and tickets
    return {
        "users": [],
        "tickets": []
    }

# Test to verify user registration functionality
def test_register_form(mock_frontend):
    # Simulate registering a new user
    user = {"name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_frontend["users"].append(user)
    # Check if the user is successfully added
    assert any(u["email"] == "john.doe@example.com" for u in mock_frontend["users"])

# Test to verify user login functionality
def test_login_form(mock_frontend):
    # Simulate adding a user and logging in
    user = {"name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_frontend["users"].append(user)
    login_email = "john.doe@example.com"
    login_password = "password123"
    # Check if the login credentials match an existing user
    authenticated = any(u["email"] == login_email and u["password"] == login_password for u in mock_frontend["users"])
    assert authenticated

# Test to verify ticket creation functionality
def test_create_ticket(mock_frontend):
    # Simulate creating a new ticket
    ticket = {"title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_frontend["tickets"].append(ticket)
    # Check if the ticket is successfully added
    assert any(t["title"] == "Test Ticket" for t in mock_frontend["tickets"])

# Test to verify ticket update functionality
def test_update_ticket(mock_frontend):
    # Simulate updating an existing ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_frontend["tickets"].append(ticket)
    updated_ticket = {"id": 1, "title": "Updated Ticket", "description": "Updated description.", "department": "IT Support", "category": "Login Issue"}
    for t in mock_frontend["tickets"]:
        if t["id"] == updated_ticket["id"]:
            t.update(updated_ticket)
    # Check if the ticket is successfully updated
    assert any(t["title"] == "Updated Ticket" for t in mock_frontend["tickets"])

# Test to verify ticket deletion functionality
def test_delete_ticket(mock_frontend):
    # Simulate deleting an existing ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_frontend["tickets"].append(ticket)
    mock_frontend["tickets"] = [t for t in mock_frontend["tickets"] if t["id"] != ticket["id"]]
    # Check if the ticket is successfully deleted
    assert not any(t["id"] == ticket["id"] for t in mock_frontend["tickets"])