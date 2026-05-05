from fastapi import Header, HTTPException, status

from app.core.config import settings


def verify_internal_token(x_api_token: str | None = Header(default=None)) -> None:
    """Apsauga vidiniams DB endpointams.

    Jeigu INTERNAL_API_TOKEN .env faile nenurodytas, dev/test rezime endpointai veikia be tokeno.
    Jeigu tokenas nurodytas, kiekviena uzklausa turi tureti headeri:
        X-API-Token: <tokenas>
    """
    if not settings.internal_api_token:
        return

    if x_api_token != settings.internal_api_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='invalid or missing internal API token',
        )
