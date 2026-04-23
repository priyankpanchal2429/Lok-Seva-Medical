# Lok Seva Medical Store

Secure web application login system with React frontend and Node.js + Express backend.

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React (Vite), Tailwind CSS v4      |
| Backend   | Node.js, Express                   |
| Auth      | bcrypt, JWT (HttpOnly cookies)     |
| Security  | Helmet, CORS, CSRF, Rate Limiting  |

---

## Quick Start

### 1. Setup Server

```bash
cd server
cp .env.example .env    # Edit secrets for production
npm install
npm run seed            # Generate hashed default user
npm run dev             # Start server on port 5000
```

### 2. Setup Client

```bash
cd client
npm install
npm run dev             # Start client on port 5173
```

### 3. Open Application

Navigate to [http://localhost:5173](http://localhost:5173)

---

## Default Credentials

| Field    | Value       |
|----------|-------------|
| User ID  | Priyank001  |
| Password | Panchal009  |

> **Note:** Password is stored as a bcrypt hash. Never committed as plaintext.

---

## Environment Variables

All environment variables are defined in `server/.env`. See `server/.env.example` for the template.

| Variable       | Description                    | Default                    |
|----------------|--------------------------------|----------------------------|
| PORT           | Server port                    | 5000                       |
| NODE_ENV       | Environment mode               | development                |
| JWT_SECRET     | Secret key for JWT signing     | (change in production)     |
| JWT_EXPIRES_IN | JWT token expiry duration      | 15m                        |
| CSRF_SECRET    | Secret for CSRF token gen      | (change in production)     |
| CLIENT_URL     | Frontend URL for CORS          | http://localhost:5173       |

---

## Security Features

- bcrypt password hashing (12 salt rounds)
- JWT stored in HttpOnly, Secure, SameSite=Strict cookies
- CSRF protection (double-submit cookie pattern)
- Per-user login rate limiting (5 attempts → 15 min lockout)
- Global API rate limiting (100 req / 15 min per IP)
- Helmet security headers
- Input sanitization (XSS prevention)
- 15-minute inactivity auto-logout

---

## File Structure

```
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── utils/              # API, auth, sanitization
│   │   ├── App.jsx             # Router + inactivity timer
│   │   └── main.jsx            # Entry point
│   └── index.html
│
├── server/                     # Express backend
│   ├── config/                 # Environment config
│   ├── controllers/            # Request handlers
│   ├── middleware/              # Auth, CSRF, rate limiting
│   ├── routes/                 # API routes
│   ├── utils/                  # Logger, hash utilities
│   └── data/                   # Seeded user data
│
└── .gitignore
```
