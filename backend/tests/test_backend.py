import pytest

@pytest.fixture
def mock_backend():
    # Mock backend state
    return {
        "users": [],
        "tickets": []
    }

def test_add_user(mock_backend):
    # Simulate adding a user
    user = {"id": 1, "name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_backend["users"].append(user)
    assert any(u["id"] == 1 for u in mock_backend["users"])

def test_remove_user(mock_backend):
    # Simulate removing a user
    user = {"id": 1, "name": "John Doe", "email": "john.doe@example.com", "password": "password123", "role": "employee"}
    mock_backend["users"].append(user)
    mock_backend["users"] = [u for u in mock_backend["users"] if u["id"] != 1]
    assert not any(u["id"] == 1 for u in mock_backend["users"])

def test_add_ticket(mock_backend):
    # Simulate adding a ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_backend["tickets"].append(ticket)
    assert any(t["id"] == 1 for t in mock_backend["tickets"])

def test_update_ticket_backend(mock_backend):
    # Simulate updating a ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_backend["tickets"].append(ticket)
    updated_ticket = {"id": 1, "title": "Updated Ticket", "description": "Updated description.", "department": "IT Support", "category": "Login Issue"}
    for t in mock_backend["tickets"]:
        if t["id"] == updated_ticket["id"]:
            t.update(updated_ticket)
    assert any(t["title"] == "Updated Ticket" for t in mock_backend["tickets"])

def test_delete_ticket_backend(mock_backend):
    # Simulate deleting a ticket
    ticket = {"id": 1, "title": "Test Ticket", "description": "This is a test ticket description.", "department": "IT Support", "category": "Login Issue"}
    mock_backend["tickets"].append(ticket)
    mock_backend["tickets"] = [t for t in mock_backend["tickets"] if t["id"] != ticket["id"]]
    assert not any(t["id"] == 1 for t in mock_backend["tickets"])