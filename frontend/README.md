# Krishi Kavach Frontend

React + Vite frontend application for the Krishi Kavach crop disease detection system.

## Features

- **Authentication**: Login and registration for farmers, agronomists, and admins
- **Farmer Features**:
  - Manage crops (add, view, delete)
  - Create disease reports with image uploads
  - View weather forecasts
  - View farming advisories
  - Profile management
- **Admin Features**:
  - Manage farmers and agronomists
  - Verify agronomist applications
  - Assign locations to agronomists
  - Manage locations
- **Agronomist Features**:
  - Update profile
  - View profile status

## Tech Stack

- **React** 18.2.0
- **Vite** 5.0.8
- **React Router DOM** 6.20.0
- **Axios** 1.6.2
- **Tailwind CSS** 3.3.6

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Unauthorized.jsx
│   │   ├── UserProfile.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Farmers.jsx
│   │   │   ├── Agronomists.jsx
│   │   │   └── Locations.jsx
│   │   ├── farmer/
│   │   │   ├── FarmerDashboard.jsx
│   │   │   ├── Crops.jsx
│   │   │   ├── DiseaseReports.jsx
│   │   │   ├── Weather.jsx
│   │   │   └── Advisories.jsx
│   │   └── agronomist/
│   │       ├── AgronomistDashboard.jsx
│   │       └── AgronomistProfile.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api/v1` by default. This can be configured via the `VITE_API_URL` environment variable.

### Authentication

- Tokens are stored in localStorage
- Access tokens are automatically included in API requests
- Token refresh is handled automatically when access tokens expire

### API Endpoints Used

- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/*` - User profile endpoints
- `/api/v1/crops/*` - Crop management endpoints
- `/api/v1/disease-reports/*` - Disease report endpoints
- `/api/v1/weather/*` - Weather data endpoints
- `/api/v1/advisories/*` - Advisory endpoints
- `/api/v1/admin/*` - Admin endpoints
- `/api/v1/agronomists/*` - Agronomist endpoints
- `/api/v1/locations/*` - Location endpoints

## Role-Based Access

The application implements role-based access control:

- **Farmer**: Can access farmer-specific pages (crops, disease reports, weather, advisories)
- **Admin**: Can access admin pages (farmers, agronomists, locations management)
- **Agronomist**: Can access agronomist pages (profile management)

## Environment Variables

- `VITE_API_URL`: Backend API URL (default: `http://localhost:5000`)

## Development

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Connecting to Backend

1. Ensure the backend server is running on `http://localhost:5000`
2. Update the `VITE_API_URL` in `.env` if your backend runs on a different port
3. The frontend will automatically connect to the backend API

## Notes

- The frontend uses Tailwind CSS for styling
- All API calls are made through the centralized API service (`src/services/api.js`)
- Authentication state is managed through React Context (`src/context/AuthContext.jsx`)
- Protected routes are implemented using the `ProtectedRoute` component
- File uploads are handled using FormData for multipart/form-data requests









