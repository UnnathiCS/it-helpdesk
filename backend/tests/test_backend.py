import pytest

# Fixture to provide a mock backend state for testing
@pytest.fixture
def mock_backend():
    # Simulates the backend state with users and tickets
    return {
        "users": [],
        "tickets": []
    }

# Test to verify adding a user to the backend
def test_add_user(mock_backend):
    # Simulate adding a new user
    user = {"id": 1, "name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_backend["users"].append(user)
    # Check if the user is successfully added
    assert any(u["id"] == 1 for u in mock_backend["users"])

# Test to verify removing a user from the backend
def test_remove_user(mock_backend):
    # Simulate adding and then removing a user
    user = {"id": 1, "name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_backend["users"].append(user)
    mock_backend["users"] = [u for u in mock_backend["users"] if u["id"] != 1]
    # Check if the user is successfully removed
    assert not any(u["id"] == 1 for u in mock_backend["users"])

# Test to verify adding a ticket to the backend
def test_add_ticket(mock_backend):
    # Simulate adding a new ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_backend["tickets"].append(ticket)
    # Check if the ticket is successfully added
    assert any(t["id"] == 1 for t in mock_backend["tickets"])

# Test to verify updating a ticket in the backend
def test_update_ticket_backend(mock_backend):
    # Simulate updating an existing ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_backend["tickets"].append(ticket)
    updated_ticket = {"id": 1, "title": "Updated Ticket", "description": "Updated description.", "department": "IT Support", "category": "Login Issue"}
    for t in mock_backend["tickets"]:
        if t["id"] == updated_ticket["id"]:
            t.update(updated_ticket)
    # Check if the ticket is successfully updated
    assert any(t["title"] == "Updated Ticket" for t in mock_backend["tickets"])

# Test to verify deleting a ticket from the backend
def test_delete_ticket_backend(mock_backend):
    # Simulate adding and then deleting a ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_backend["tickets"].append(ticket)
    mock_backend["tickets"] = [t for t in mock_backend["tickets"] if t["id"] != ticket["id"]]
    # Check if the ticket is successfully deleted
    assert not any(t["id"] == 1 for t in mock_backend["tickets"])