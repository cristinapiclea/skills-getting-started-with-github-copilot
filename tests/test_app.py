from fastapi.testclient import TestClient

from src.app import activities, app


client = TestClient(app)


def test_unregister_participant_removes_email_from_activity():
    activity_name = "Chess Club"
    original_participants = activities[activity_name]["participants"][:]

    try:
        email = original_participants[0]
        response = client.delete(f"/activities/{activity_name}/participants/{email}")

        assert response.status_code == 200
        assert email not in activities[activity_name]["participants"]
    finally:
        activities[activity_name]["participants"] = original_participants


def test_unregister_participant_returns_404_when_not_found():
    response = client.delete("/activities/Chess Club/participants/not-a-student@example.com")

    assert response.status_code == 404
