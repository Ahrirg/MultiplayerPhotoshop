"""Deprecated.

Authority no longer owns a local SQLite database.
All persistent data must go through Back_end_database internal endpoints:
    Authority -> Back_end_database /internal/...

This file is intentionally kept only so older imports fail less confusingly if a teammate opens it.
Do not use it for new code.
"""

raise RuntimeError(
    "Back_end_authority/database.py is deprecated. "
    "Use HTTP calls from authority to Back_end_database /internal endpoints instead."
)
