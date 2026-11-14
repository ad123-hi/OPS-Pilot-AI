"""Password and signed access-token helpers (stdlib only)."""

import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import HTTPException, status

from app.core.config import settings

PASSWORD_ITERATIONS = 600_000
JWT_ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    if len(password) < 8 or len(password) > 1024:
        raise HTTPException(status_code=422, detail="Password must be 8-1024 characters")
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${_b64(salt)}${_b64(digest)}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt, expected = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), _unb64(salt), int(iterations))
        return hmac.compare_digest(actual, _unb64(expected))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int, organization_id: int, role: str, token_version: int) -> str:
    secret = _secret()
    now = int(time.time())
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": str(user_id), "org": organization_id, "role": role,
        "ver": token_version, "iat": now,
        "exp": now + settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }
    body = f"{_encode_json(header)}.{_encode_json(payload)}"
    signature = hmac.new(secret, body.encode(), hashlib.sha256).digest()
    return f"{body}.{_b64(signature)}"


def decode_access_token(token: str) -> dict:
    try:
        header_part, payload_part, signature_part = token.split(".")
        header = json.loads(_unb64(header_part))
        payload = json.loads(_unb64(payload_part))
        if header != {"alg": JWT_ALGORITHM, "typ": "JWT"}:
            raise ValueError("Unsupported token header")
        body = f"{header_part}.{payload_part}"
        expected = hmac.new(_secret(), body.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _unb64(signature_part)):
            raise ValueError("Invalid signature")
        if not isinstance(payload.get("exp"), int) or payload["exp"] <= int(time.time()):
            raise ValueError("Expired token")
        if not payload.get("sub") or not isinstance(payload.get("org"), int):
            raise ValueError("Invalid token claims")
        return payload
    except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def _secret() -> bytes:
    value = settings.JWT_SECRET_KEY
    if len(value.encode()) < 32:
        raise HTTPException(status_code=500, detail="JWT_SECRET_KEY must contain at least 32 bytes")
    return value.encode()


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode()


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _encode_json(value: dict) -> str:
    return _b64(json.dumps(value, separators=(",", ":"), sort_keys=True).encode())
