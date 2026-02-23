# Mine Ops | مدیریت عملیات معدن

A full-stack Dockerized CRUD platform for managing gold mining supply chain operations in Persian (Farsi) with RTL layout and Jalali date support.

---

## راه‌اندازی سریع | Quick Start

### پیش‌نیازها | Prerequisites

- Docker Engine 24+
- Docker Compose v2.x

### اجرا | Run

```bash
# 1. Clone the repository
git clone https://github.com/soroush-yasini/Mine-Ops.git
cd Mine-Ops

# 2. Copy environment variables file
cp .env.example .env
# (Optional) Edit .env to customize settings

# 3. Start all services
docker compose up --build
```

Once started, the services are available at:

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |

### Alembic Migrations

Migrations run automatically when the backend starts. To run them manually:

```bash
docker compose exec backend alembic upgrade head
```

---

## اطلاعات ورود پیش‌فرض | Default Credentials

| نقش | نام کاربری | رمز عبور |
|-----|------------|----------|
| مدیر (Manager) | admin | admin123 |

> ⚠️ Change the default password after first login in a production environment.

---

## متغیرهای محیطی | Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `mineops` | Database name |
| `SECRET_KEY` | `changeme-...` | JWT signing secret (change in production!) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiry (24 hours) |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL (seen by browser) |

---

## ماژول‌های سیستم | System Modules

### مدیریت پایه | Master Data
- **رانندهها** (Drivers) — Manage truck drivers with IBAN and phone
- **ماشینها** (Trucks) — Manage truck fleet by plate number
- **سایت‌های آسیاب** (Grinding Sites) — Sites: A/Hejazian, B/Shen Beton, C/Kavian
- **انواع نمونه** (Sample Types) — Extensible lookup: K, T, CR, RC, L, ... (manager only)

### حمل‌ونقل | Transport
- **معدن به آسیاب** (Mine → Grinding) — Two-phase transport records (init + payment)
- **آسیاب به کارخانه** (Grinding → Factory / Bunker) — Two-phase with dead freight auto-compute

### هزینه آسیاب | Grinding Costs
- Ledger with debit/credit and running balance per site

### آزمایشگاه | Laboratory
- **دسته‌های آنالیز** (Lab Batches) — Group assay results with PDF receipt upload
- **نمونه‌ها** (Lab Assays) — Individual gold assays with auto-parsed sample codes

---

## ویژگی‌های کلیدی | Key Features

- **RTL Layout** — Full right-to-left Persian UI using Material UI v5
- **Jalali Dates** — All dates entered and displayed in Hijri Shamsi (Jalali) format; stored as both Jalali string and Gregorian date in DB
- **Smart Autocompletes** — Driver, Truck, and Site fields are always selected from existing records (no free text)
- **Two-Phase Transport** — Mine and Bunker transport records have initialization phase and payment phase; unpaid records highlighted in amber
- **Dead Freight Auto-compute** — `is_dead_freight` and `billed_tonnage_kg` computed server-side for bunker transport
- **Running Balance** — Grinding cost balance computed dynamically as running sum per site
- **Excel Import** — Import records from .xlsx files with preview and validation
- **File Uploads** — Bill of lading images, payment receipt images, lab PDFs stored on Docker volume
- **JWT Auth** — Stateless authentication with role-based access (manager / teammate)

---

## نقش‌های کاربری | User Roles

| عملیات | همکار (teammate) | مدیر (manager) |
|--------|----------------|----------------|
| ایجاد رکورد | ✅ | ✅ |
| مشاهده رکورد | ✅ | ✅ |
| ویرایش رکورد | ✅ | ✅ |
| حذف رکورد | ❌ | ✅ |
| مدیریت کاربران | ❌ | ✅ |
| مدیریت انواع نمونه | ❌ | ✅ |

---

## معماری فنی | Technical Architecture

```
┌─────────────────────────────────────────────┐
│              Docker Compose                  │
│                                             │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │ Frontend │   │ Backend  │   │   DB    │ │
│  │ React 18 │──▶│ FastAPI  │──▶│ Postgres│ │
│  │ Vite     │   │ SQLAlch  │   │   15    │ │
│  │ Port 3000│   │ Port 8000│   │ Port 5432│ │
│  └──────────┘   └──────────┘   └─────────┘ │
└─────────────────────────────────────────────┘
```

### Backend Structure
```
backend/
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── alembic/
│   └── versions/   (001_initial, 002_seed)
└── app/
    ├── core/       (config, security, deps)
    ├── db/         (base, session)
    ├── models/     (10 SQLAlchemy models)
    ├── schemas/    (Pydantic v2 schemas)
    ├── crud/       (CRUD operations)
    ├── routers/    (11 FastAPI routers)
    └── utils/      (jalali, excel_import, sample_parser)
```

### Frontend Structure
```
frontend/
├── Dockerfile
├── package.json
└── src/
    ├── api/           (Axios clients per module)
    ├── context/       (AuthContext with JWT)
    ├── components/
    │   ├── layout/    (RTLProvider, Sidebar, Topbar)
    │   └── shared/    (JalaliDatePicker, Autocompletes, FileUpload, ExcelImport)
    └── pages/
        ├── auth/      (Login)
        ├── drivers/, trucks/, grinding_sites/
        ├── mine_transport/, bunker_transport/
        ├── grinding_costs/
        ├── lab/       (BatchList, BatchDetail, AssayForm)
        ├── sample_types/, users/
        └── Dashboard.tsx
```
