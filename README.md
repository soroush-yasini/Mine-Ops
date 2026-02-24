# Mine-Ops

Operations management system for mining facilities.

## Quick Start

```bash
docker compose up --build -d
```

## After Schema Changes

After any database schema changes (e.g., model updates or new Alembic migrations), rebuild and restart all services to apply migrations and update the frontend:

```bash
docker compose down
docker compose up --build -d
```

This will:
1. Rebuild the backend and frontend Docker images
2. Run Alembic migrations automatically on startup
3. Serve the updated frontend

## Seeding Data from Excel

To import financial ledger data from an Excel file:

```bash
python scripts/seed_from_excel.py --financial-ledger path/to/ledger.xlsx --facility A
```

Available facility codes: `A` (رباط سفید), `B` (شن بتن), `C` (کاویان)
