# Multiplayer Photoshop DB backend

FastAPI + SQLite DB servisas. Šita dalis turi saugoti vartotojus, temas, paveikslėlių metaduomenis, aktyvias sesijas ir baigtų žaidimų istoriją.

## Paleidimas

```bash
uv sync
uv run uvicorn app.main:app --reload
```

Swagger:

```txt
http://127.0.0.1:8000/docs
```

## Konfigūracija

Galimi `.env` kintamieji:

```env
DATABASE_URL=sqlite:///./data/app.db
DATA_DIR=./data
INTERNAL_API_TOKEN=change-this-token
```

Jeigu `INTERNAL_API_TOKEN` tuščias, dev režime vidiniai endpointai veikia be tokeno. Kai DB bus jungiama tik per `authority`, šitą tokeną reikia nurodyti ir DB, ir `authority` `.env` failuose.

## Endpointai

Vieši/dev endpointai:

- `GET /health`
- `GET /info`
- `POST /users`
- `GET /users`
- `POST /themes`
- `GET /themes`
- `POST /images`
- `GET /images/{image_id}`
- `POST /live-sessions`
- `GET /live-sessions`
- `GET /live-sessions/{session_id}`
- `PATCH /live-sessions/{session_id}`
- `POST /live-sessions/{session_id}/players`
- `DELETE /live-sessions/{session_id}/players/{player_id}`
- `POST /game-sessions`
- `GET /game-sessions`

Vidiniai endpointai authority serveriui turi tokį patį kelią, tik su `/internal`, pvz.:

- `POST /internal/live-sessions`
- `POST /internal/live-sessions/{session_id}/players`
- `POST /internal/game-sessions`

Kai `INTERNAL_API_TOKEN` nurodytas, authority turi siųsti headerį:

```txt
X-API-Token: change-this-token
```

## Pavyzdys: aktyvi sesija su neribotu žaidėjų kiekiu

Sukurti sesiją:

```json
POST /live-sessions
{
  "session_id": "abc123",
  "host": "127.0.0.1",
  "port": 7777,
  "status": "waiting"
}
```

Pridėti normalų vartotoją:

```json
POST /live-sessions/abc123/players
{
  "user_id": 1
}
```

Pridėti guest:

```json
POST /live-sessions/abc123/players
{
  "guest_name": "Guest123"
}
```

Pridėti dar vieną guest:

```json
POST /live-sessions/abc123/players
{
  "guest_name": "Guest456"
}
```

`GET /live-sessions/abc123` grąžins sesiją su `players` masyvu, kuriame gali daug žaidėjų.


Papildomai aktyviai sesijai palaikomas dabartinis žaidimo paveiksliukas:
- PATCH /internal/live-sessions/{session_id}/current-image su {"image_id": 1}
- GET /internal/live-sessions/{session_id}/current-image grąžina patį paveiksliuko failą

Žaidėjo rolę galima atnaujinti:
- PATCH /internal/live-sessions/{session_id}/players/{player_id} su {"role": "imposter"}

Endgame animacija ir garso efektai nėra saugomi DB - tai frontend/session įvykiai.
