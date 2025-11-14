# Momentum SWELAB Architecture

## System Overview

Web application for managing hardware resources across collaborative projects. React frontend, Flask backend, MongoDB database.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │   Dashboard  │   │ Login/Reg    │   │ User Portal  │     │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │  React Router  │                       │
│                    │ (BrowserRouter)│                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/REST API
                             │ (axios/fetch)
┌────────────────────────────▼────────────────────────────────┐
│                       API LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Flask Application (app.py)              │   │
│  │  ┌──────────┐   ┌──────────┐  ┌──────────┐           │   │
│  │  │  /login  │   │ /register│  │ /portal  │  ...      │   │
│  │  └────┬─────┘   └────┬─────┘  └────┬─────┘           │   │
│  └───────┼──────────────┼─────────────┼─────────────────┘   │
│          │              │             │                     │
│  ┌───────▼──────────────▼─────────────▼─────────────────┐   │
│  │        Database Utility Layer (db_utils.py)          │   │
│  │        - Connection pooling                          │   │
│  │        - Error handling                              │   │
│  └───────┬──────────────────────────────────────────────┘   │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐   │
│  │   usersDB    │   │ projectsDB   │   │ hardwareDB     │   │
│  │              │   │              │   │                │   │
│  │ - addUser    │   │ - createProj │   │ - createHW     │   │
│  │ - login      │   │ - addUser    │   │ - queryHW      │   │
│  │ - joinProj   │   │ - checkOut   │   │ - updateAvail  │   │
│  │ - getProjs   │   │ - checkIn    │   │ - requestSpace │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬─────────┘   │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │    MongoDB     │                       │
│                    │  (momentum_    │                       │
│                    │   swelab DB)   │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Components

**Frontend**: Dashboard, Login/Registration, User Portal pages. Router in `App.js`, shared styles in `sharedStyles.js`.

**Backend**: Flask routes in `app.py`. Database modules: `usersDatabase.py`, `projectsDatabase.py`, `hardwareDatabase.py`. Security via `decryptEncrypt.py`.

## Data Flow

**Registration**: Form → POST /register → Encrypt → MongoDB → Response

**Login**: Form → POST /login → Verify → Session → Portal

**Checkout**: Portal → POST /check_out → Update Project & Hardware Availability → Response

## Security & Deployment

**Security**: Session-based auth, encrypted passwords, CORS restrictions, input validation.

**Deployment**: Frontend on GitHub Pages, Backend on Render, Database on MongoDB Atlas.

**Scalability**: MongoDB horizontal scaling, Gunicorn for production, CDN-ready static build.
