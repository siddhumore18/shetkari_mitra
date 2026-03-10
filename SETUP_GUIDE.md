# 🚀 Krishi Kavach - Project Setup Guide

Welcome to the definitive setup guide for the Krishi Kavach platform. This guide explains how to configure and run the entire local development environment including the Node.js backend, React frontend, and Python-based ML Server.

## 📋 Prerequisites
Before you start, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Python** (v3.8 or higher, v3.11+ recommended)
- **MongoDB** (Local instance or Atlas URI)
- **Git**

---

## 🏗️ 1. Backend Setup

The backend acts as the core API, combining database access, authentication, and integrations with external APIs and the local ML Server.

1. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename the `.env.example` file to `.env` or create a new `.env` file and verify the variables. Add in your private keys for the following definitions:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Your secure keys.
   - `CLOUDINARY_*`: Cloudinary credentials to handle crop images.
   - `OPENWEATHERMAP_API_KEY`: OpenWeatherMap to get realtime weather advisories.
   - `GOV_KEY`: Gov.in API key.
   - `GROK_API_KEY` or `GOOGLE_CLOUD_PROJECT_ID`: Used for additional AI context integration.

4. **Start the Backend Server (development mode):**
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

---

## 🧪 2. Machine Learning Server Setup (crop_project)

The Machine Learning server runs on FastAPI and uses a fine-tuned YOLO model (`ultralytics`) to identify plant diseases based on uploaded images.

1. **Navigate to the ML Project directory:**
   ```bash
   cd crop_project
   ```

2. **Create a Virtual Environment:**
   *(It is highly recommended to isolate Python dependencies)*
   ```bash
   python -m venv .venv
   ```

3. **Activate the Virtual Environment:**
   - **Windows:**
     ```bash
     .venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     source .venv/bin/activate
     ```

4. **Install Python Packages:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Start the ML Server:**
   ```bash
   python app.py
   ```
   *The ML server will start running on `http://127.0.0.1:8000` and process image-inference requests.*

---

## 🎨 3. Frontend Setup

The frontend is a React application styled with TailwindCSS and bundled using Vite.

1. **Navigate to the Frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename the `.env.example` file to `.env` and verify the values. Make sure it points to the local backend during development.
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The client app should now be running, typically at `http://localhost:5173`. Open this URL in your browser to interact with the platform.*

---

## 🧠 Additional Notes
- Ensure **all three servers** (Frontend `Vite`, Backend `Express`, ML `FastAPI`) are running concurrently for the application to function fully.
- We have correctly set up `.gitignore` files to ignore `.env`, virtual environments `(.venv)`, Large cached model files `(*.pt)`, and `node_modules`. 
- You can now safely push your project cleanly to GitHub by running:
  ```bash
  git add .
  git commit -m "Initialize project and prepare environment files"
  git push origin main
  ```
