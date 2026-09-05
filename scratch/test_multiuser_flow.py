import urllib.request
import json
import sys

BASE_URL = "http://localhost/api/v1"

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        print(f"HTTP Error {e.code} on {method} {endpoint}: {res_body}")
        return e.code, json.loads(res_body) if res_body else {}

def main():
    print("--- 1. Register / Login User 1 (testinguser@gmail.com) ---")
    user1_creds = {"name": "Testing User", "email": "testinguser@gmail.com", "password": "TestingUser"}
    status, res = request("/auth/register", "POST", user1_creds)
    if status != 200:
        print("Registration response not 200, attempting login...")
        status, res = request("/auth/login", "POST", {"email": user1_creds["email"], "password": user1_creds["password"]})
    
    assert status == 200, f"User 1 Login/Register failed: {res}"
    user1_token = res["accessToken"]
    print("User 1 authenticated successfully. User ID:", res["user"]["id"])

    print("\n--- 2. Register / Login User 2 (ksheth025@gmail.com) ---")
    user2_creds = {"name": "Keval Sheth", "email": "ksheth025@gmail.com", "password": "KevalSheth"}
    status, res = request("/auth/register", "POST", user2_creds)
    if status != 200:
        print("Registration response not 200, attempting login...")
        status, res = request("/auth/login", "POST", {"email": user2_creds["email"], "password": user2_creds["password"]})
    
    assert status == 200, f"User 2 Login/Register failed: {res}"
    user2_token = res["accessToken"]
    user2_id = res["user"]["id"]
    print("User 2 authenticated successfully. User ID:", user2_id)

    print("\n--- 3. User 1 Creates Real Whiteboard ---")
    board_payload = {
        "name": "Q3 System Architecture & Live Roadmap",
        "template": "BLANK"
    }
    status, board = request("/boards", "POST", board_payload, token=user1_token)
    assert status == 200, f"Board creation failed: {board}"
    board_id = board["id"]
    print(f"Board created! Board ID: {board_id}, Name: '{board['name']}'")

    print("\n--- 4. User 1 Adds Real Drawing Elements ---")
    elements = [
        {
            "elementId": "rect-arch-1",
            "type": "rect",
            "props": {"x": 100, "y": 120, "width": 240, "height": 140, "strokeColor": "#6366f1", "fillColor": "rgba(99, 102, 241, 0.1)"},
            "zIndex": 1,
            "version": 1
        },
        {
            "elementId": "sticky-idea-1",
            "type": "sticky",
            "props": {"x": 380, "y": 120, "width": 180, "height": 140, "text": "Deploy Spring Boot microservices on Kubernetes", "fillColor": "#fef08a"},
            "zIndex": 2,
            "version": 1
        },
        {
            "elementId": "text-title-1",
            "type": "text",
            "props": {"x": 100, "y": 60, "width": 400, "height": 40, "text": "High-Throughput Collaborative Canvas Architecture", "strokeColor": "#f8fafc"},
            "zIndex": 3,
            "version": 1
        }
    ]
    status, updated_board = request(f"/boards/{board_id}", "PATCH", {"elements": elements}, token=user1_token)
    assert status == 200, f"Updating board elements failed: {updated_board}"
    print(f"Elements added! Total elements on board: {len(updated_board['elements'])}")

    print("\n--- 5. User 1 Invites User 2 (ksheth025@gmail.com) as EDITOR ---")
    invite_payload = {"email": "ksheth025@gmail.com", "role": "EDITOR"}
    status, shared_board = request(f"/boards/{board_id}/collaborators", "POST", invite_payload, token=user1_token)
    assert status == 200, f"Invite failed: {shared_board}"
    print("Collaborator invited successfully! Current collaborators:", len(shared_board["collaborators"]))

    print("\n--- 6. User 2 Fetches Boards & Accesses Shared Board ---")
    status, user2_boards = request("/boards", "GET", token=user2_token)
    assert status == 200, f"User 2 fetch boards failed: {user2_boards}"
    found = any(b["id"] == board_id for b in user2_boards)
    assert found, "Shared board not present in User 2 boards list!"
    print("User 2 successfully retrieved shared board from Dashboard!")

    print("\n--- 7. User 2 Edits & Adds Elements to Shared Board ---")
    status, current_board = request(f"/boards/{board_id}", "GET", token=user2_token)
    existing_elements = current_board["elements"]
    user2_element = {
        "elementId": "sticky-user2-feedback",
        "type": "sticky",
        "props": {"x": 600, "y": 120, "width": 180, "height": 140, "text": "Verified Redis Pub/Sub multi-node scaling!", "fillColor": "#bbf7d0"},
        "zIndex": 4,
        "version": 1
    }
    existing_elements.append(user2_element)
    status, final_board = request(f"/boards/{board_id}", "PATCH", {"elements": existing_elements}, token=user2_token)
    assert status == 200, f"User 2 element edit failed: {final_board}"
    print(f"User 2 successfully added element! Total elements now: {len(final_board['elements'])}")

    print("\n--- 8. Generate & Test AI Summary & Transcript ---")
    status, summary = request(f"/boards/{board_id}/summary?force=true", "POST", token=user1_token)
    assert status == 200, f"AI Summary generation failed: {summary}"
    print("AI Summary generated:", summary.get("content", "")[:120] + "...")

    print("\n[SUCCESS] MULTI-USER END-TO-END VERIFICATION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
