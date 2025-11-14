# Momentum SWELAB

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

A web application for managing hardware resources across collaborative projects. Built with React frontend, Flask backend, and MongoDB database.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**: Registration, login, password reset
- **Project Management**: Create projects, join/leave projects, view project details
- **Hardware Management**: Checkout/check-in hardware sets, track availability
- **Real-time Updates**: Hardware availability updates in real-time
- **Secure**: Encrypted passwords, session management, CORS protection

## Tech Stack

### Frontend
- **React 19.2** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Flask 3.0** - Web framework
- **MongoDB** - Database (via PyMongo)
- **Gunicorn** - Production WSGI server

### Infrastructure
- **GitHub Pages** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting

## Project Structure

```
momentum-swelab/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── styles/        # Shared styles
│   └── package.json
├── server/                 # Flask backend
│   ├── app.py             # Main application file
│   ├── usersDatabase.py  # User management functions
│   ├── projectsDatabase.py # Project management functions
│   ├── hardwareDatabase.py # Hardware management functions
│   └── db_utils.py        # Database utilities
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── ARCHITECTURE.md        # System architecture documentation
├── SYSTEM_REQUIREMENTS.md # System requirements specification
├── CONTRIBUTING.md        # Contribution guidelines
└── README.md             # This file
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **MongoDB** account (MongoDB Atlas recommended)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Code-Tomato/momentum-swelab.git
   cd momentum-swelab
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

1. **Backend Environment Variables**
   
   Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your values:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
   ```

2. **Frontend Environment Variables**
   
   Copy `client/.env.example` to `client/.env`:
   ```bash
   cp client/.env.example client/.env
   ```
   
   Edit `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

## Development

### Running Locally

1. **Start the backend server**
   ```bash
   cd server
   python app.py
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Code Quality

- **Linting**: ESLint for JavaScript/React, flake8 for Python
- **Formatting**: Prettier for JavaScript/React
- **CI/CD**: GitHub Actions runs linting and formatting checks on push/PR

Run formatting:
```bash
npx prettier --write "client/src/**/*.{js,jsx}"
```

## Deployment

This project is configured to deploy the React frontend to GitHub Pages and the Flask backend to Render.

### Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### Setup Instructions

#### 1. Configure GitHub Pages

1. Update the `homepage` field in `client/package.json` with your GitHub Pages URL:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/momentum-swelab"
   ```

2. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy on push to `main`

#### 2. Setup Render Backend

1. Create a new account at [render.com](https://render.com) and connect your GitHub repository

2. Create a new Web Service:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file automatically
   - Or manually configure:
     - **Name**: `momentum-swelab-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `gunicorn --chdir server app:app`

3. Set Environment Variables in Render Dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: Automatically set by Render (don't override)
   - `ALLOWED_ORIGINS`: Your GitHub Pages URL

4. After deployment, note your Render service URL (e.g., `https://momentum-swelab-backend.onrender.com`)

#### 3. Configure GitHub Actions

1. Add GitHub Secrets (Settings → Secrets and variables → Actions):
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., `https://momentum-swelab-backend.onrender.com`)
   - (Optional) `RENDER_API_KEY`: Your Render API key for automated deployments
   - (Optional) `RENDER_SERVICE_ID`: Your Render service ID

2. The GitHub Actions workflow will:
   - Build and deploy the React app to GitHub Pages on every push to `main`
   - Optionally trigger Render deployment (or Render will auto-deploy via webhook)

#### 4. Update CORS

Once you have your GitHub Pages URL, update the `ALLOWED_ORIGINS` environment variable in Render to include your GitHub Pages URL.

## API Documentation

See [API.md](docs/API.md) for complete API documentation, or check the OpenAPI specification.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the CC0-1.0 License - see the [LICENSE](LICENSE) file for details.

## Additional Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and design
- [SYSTEM_REQUIREMENTS.md](SYSTEM_REQUIREMENTS.md) - Functional and non-functional requirements
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
