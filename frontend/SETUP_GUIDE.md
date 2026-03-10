# Frontend Setup Guide

## Folder Structure

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Reusable components
│   │   ├── Navbar.jsx              # Navigation bar component
│   │   └── ProtectedRoute.jsx      # Route protection component
│   ├── context/                     # React Context providers
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/                       # Page components
│   │   ├── Home.jsx                # Home page
│   │   ├── Login.jsx               # Login page
│   │   ├── Register.jsx            # Registration page
│   │   ├── Unauthorized.jsx        # Unauthorized access page
│   │   ├── UserProfile.jsx         # User profile page
│   │   ├── admin/                  # Admin pages
│   │   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   │   ├── Farmers.jsx         # Farmers list
│   │   │   ├── Agronomists.jsx     # Agronomists list
│   │   │   └── Locations.jsx       # Locations management
│   │   ├── farmer/                 # Farmer pages
│   │   │   ├── FarmerDashboard.jsx # Farmer dashboard
│   │   │   ├── Crops.jsx           # Crop management
│   │   │   ├── DiseaseReports.jsx  # Disease reports
│   │   │   ├── Weather.jsx         # Weather forecast
│   │   │   └── Advisories.jsx      # Farming advisories
│   │   └── agronomist/             # Agronomist pages
│   │       ├── AgronomistDashboard.jsx  # Agronomist dashboard
│   │       └── AgronomistProfile.jsx    # Agronomist profile
│   ├── services/                    # API services
│   │   └── api.js                  # Axios API configuration
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── .gitignore                       # Git ignore file
└── README.md                        # Documentation
```

## How to Run the Frontend

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Create Environment File

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

**Note**: If your backend runs on a different port, update the URL accordingly.

### Step 3: Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### Step 4: Start the Backend

Make sure your backend server is running on `http://localhost:5000` (or the port specified in your `.env` file).

## Connecting Frontend to Backend

1. **Backend must be running**: Ensure your Node.js/Express backend is running on port 5000 (or your configured port).

2. **CORS Configuration**: The backend should have CORS enabled to allow requests from `http://localhost:3000`. Check your backend's `app.js` or `server.js` file.

3. **API Base URL**: The frontend uses the `VITE_API_URL` environment variable to connect to the backend. Make sure it matches your backend URL.

4. **Authentication**: 
   - Tokens are stored in localStorage
   - Access tokens are automatically included in API requests via axios interceptors
   - Token refresh is handled automatically

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features by Role

### Farmer
- Register/Login
- Manage crops (add, view, delete)
- Create disease reports with image uploads
- View weather forecasts
- View farming advisories
- Update profile and change password

### Admin
- Register/Login
- View all farmers
- View all agronomists
- Verify agronomist applications
- Assign locations to agronomists
- Manage locations (add, view)
- Update profile and change password

### Agronomist
- Register/Login (requires ID proof upload)
- Update profile (qualification, experience)
- View profile status (pending/verified/rejected)
- Update profile and change password

## API Endpoints Used

The frontend connects to these backend endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/users/me` - Get user profile
- `PUT /api/v1/users/update` - Update user profile
- `PUT /api/v1/users/change-password` - Change password
- `POST /api/v1/users/upload-photo` - Upload profile photo
- `DELETE /api/v1/users/delete-photo` - Delete profile photo
- `GET /api/v1/crops` - Get farmer's crops
- `POST /api/v1/crops` - Add crop
- `DELETE /api/v1/crops/:id` - Delete crop
- `GET /api/v1/disease-reports` - Get disease reports
- `POST /api/v1/disease-reports` - Create disease report
- `PUT /api/v1/disease-reports/:id/mark-treated` - Mark report as treated
- `GET /api/v1/weather` - Get weather forecast
- `GET /api/v1/advisories` - Get advisories
- `GET /api/v1/admin/farmers` - List farmers (admin only)
- `GET /api/v1/admin/agronomists` - List agronomists (admin only)
- `PUT /api/v1/admin/agronomist/:id/assign-locations` - Assign locations (admin only)
- `GET /api/v1/locations` - List locations (admin only)
- `POST /api/v1/locations` - Add location (admin only)
- `GET /api/v1/agronomists/me` - Get agronomist profile
- `PUT /api/v1/agronomists/me` - Update agronomist profile
- `PUT /api/v1/agronomists/:id/verify` - Verify agronomist (admin only)

## Troubleshooting

### Frontend not connecting to backend

1. Check if backend is running on the correct port
2. Verify `VITE_API_URL` in `.env` file matches backend URL
3. Check browser console for CORS errors
4. Verify backend CORS configuration allows `http://localhost:3000`

### Authentication issues

1. Check if tokens are being stored in localStorage
2. Verify backend JWT secrets are configured
3. Check browser console for authentication errors
4. Try logging out and logging back in

### File upload issues

1. Verify backend supports multipart/form-data
2. Check file size limits
3. Verify Cloudinary configuration (if used)
4. Check browser console for upload errors

## Development Notes

- The frontend uses Tailwind CSS for styling
- All API calls are centralized in `src/services/api.js`
- Authentication state is managed via React Context
- Protected routes are implemented using `ProtectedRoute` component
- File uploads use FormData for multipart/form-data requests
- Token refresh is handled automatically via axios interceptors

## Production Build

To build for production:

```bash
npm run build
```

The production build will be in the `dist` directory. You can serve it using any static file server or deploy it to a hosting service like Vercel, Netlify, or AWS S3.









