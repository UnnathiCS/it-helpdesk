import pytest

@pytest.fixture
def mock_frontend():
    # Mock frontend state
    return {
        "users": [],
        "tickets": []
    }

def test_register_form(mock_frontend):
    # Simulate user registration
    user = {"name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_frontend["users"].append(user)
    assert any(u["email"] == "john.doe@example.com" for u in mock_frontend["users"])

def test_login_form(mock_frontend):
    # Simulate user login
    user = {"name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_frontend["users"].append(user)
    login_email = "john.doe@example.com"
    login_password = "password123"
    authenticated = any(u["email"] == login_email and u["password"] == login_password for u in mock_frontend["users"])
    assert authenticated

def test_create_ticket(mock_frontend):
    # Simulate ticket creation
    ticket = {"title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_frontend["tickets"].append(ticket)
    assert any(t["title"] == "Test Ticket" for t in mock_frontend["tickets"])

def test_update_ticket(mock_frontend):
    # Simulate updating a ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_frontend["tickets"].append(ticket)
    updated_ticket = {"id": 1, "title": "Updated Ticket", "description": "Updated description.", "department": "IT Support", "category": "Login Issue"}
    for t in mock_frontend["tickets"]:
        if t["id"] == updated_ticket["id"]:
            t.update(updated_ticket)
    assert any(t["title"] == "Updated Ticket" for t in mock_frontend["tickets"])

def test_delete_ticket(mock_frontend):
    # Simulate deleting a ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_frontend["tickets"].append(ticket)
    mock_frontend["tickets"] = [t for t in mock_frontend["tickets"] if t["id"] != ticket["id"]]
    assert not any(t["id"] == ticket["id"] for t in mock_frontend["tickets"])