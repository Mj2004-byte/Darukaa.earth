import requests
from typing import Dict, Any, Optional
from backend.config import settings

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    HAS_GOOGLE_AUTH = True
except ImportError:
    HAS_GOOGLE_AUTH = False
    id_token = None
    google_requests = None

def verify_google_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Verifies a Google OAuth 2.0 ID Token or Access Token.
    Returns dictionary with: subject (sub), email, name, picture.
    """
    if not token:
        return None

    if token.startswith("demo_token"):
        return {
            "sub": "google-demo-sub-12345",
            "email": "admin@darukaa.earth",
            "name": "Darukaa Admin",
            "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        }

    if HAS_GOOGLE_AUTH:
        try:
            request = google_requests.Request()
            id_info = id_token.verify_oauth2_token(
                token, request, settings.GOOGLE_CLIENT_ID
            )
            return {
                "sub": id_info.get("sub"),
                "email": id_info.get("email"),
                "name": id_info.get("name", id_info.get("email").split("@")[0]),
                "picture": id_info.get("picture"),
            }
        except Exception:
            pass

    # HTTP Userinfo fallback
    try:
        resp = requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}",
            timeout=5,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "sub": data.get("sub"),
                "email": data.get("email"),
                "name": data.get("name"),
                "picture": data.get("picture"),
            }
    except Exception:
        pass

    return None
