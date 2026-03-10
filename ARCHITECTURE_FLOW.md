# User Registration and Location Update Flow

## Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      REGISTRATION PAGE                          │
│                    /register (Frontend)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Select Role    │
                    │  - Farmer       │
                    │  - Agronomist   │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   FARMER FLOW         │   │  AGRONOMIST FLOW      │
    │                       │   │                       │
    │ Required Fields:      │   │ Required Fields:      │
    │ ✓ Full Name          │   │ ✓ Full Name          │
    │ ✓ Mobile Number      │   │ ✓ Mobile Number      │
    │ ✓ Password           │   │ ✓ Password           │
    │                       │   │ ✓ Location (Map)     │
    │ Optional:             │   │ ✓ Qualification      │
    │ • Language           │   │ ✓ Experience         │
    │                       │   │ ✓ ID Proof Upload    │
    │                       │   │                       │
    │ No Map Required       │   │ Optional:             │
    │                       │   │ • District           │
    │                       │   │ • Taluka             │
    │                       │   │ • Language           │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                │                           ▼
                │               ┌───────────────────────┐
                │               │  Upload to Cloudinary │
                │               │  Create Media Record  │
                │               └───────────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │  Create User Record   │   │  Create User Record   │
    │  role: 'farmer'       │   │  role: 'agronomist'   │
    │  status: active       │   │  + Create Agronomist  │
    │                       │   │    Profile            │
    │                       │   │  status: 'pending'    │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │  Redirect to Login    │   │  Redirect to Login    │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │  Can Login            │   │  Cannot Login Until   │
    │  Immediately          │   │  Admin Verification   │
    └───────────────────────┘   └───────────────────────┘
                │                           │
                │                           ▼
                │               ┌───────────────────────┐
                │               │  Admin Verifies       │
                │               │  status: 'verified'   │
                │               └───────────────────────┘
                │                           │
                └───────────────┬───────────┘
                                ▼
                    ┌───────────────────────┐
                    │   LOGIN SUCCESSFUL    │
                    │   Access Dashboard    │
                    └───────────────────────┘
```

## Location Update Flow (Post-Login)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGGED IN                          │
│                    (Farmer or Agronomist)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Navigate to    │
                    │  Profile Page   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Click on       │
                    │  "Location" Tab │
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOCATION UPDATE COMPONENT                    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              Interactive Map (Leaflet)                 │    │
│  │                                                         │    │
│  │  • Shows current location (if set)                     │    │
│  │  • Click to select new location                        │    │
│  │  • Marker shows selected point                         │    │
│  │  • Zoom controls                                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Reverse Geocoding (Nominatim API)             │    │
│  │         Auto-fill District & Taluka                    │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │  District: [Auto-filled / Editable]                   │    │
│  │  Taluka:   [Auto-filled / Editable]                   │    │
│  └───────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         [Update Location Button]                       │    │
│  └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Send PUT       │
                    │  Request to API │
                    │  /update-location│
                    └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND PROCESSING                         │
│                                                                 │
│  1. Validate JWT Token                                         │
│  2. Validate latitude & longitude                              │
│  3. Create GeoJSON Point object                                │
│  4. Update User document in MongoDB                            │
│  5. Return updated user object                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Success!       │
                    │  Show Message   │
                    │  Update Profile │
                    └─────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Register    │  │   Login      │  │  Profile     │        │
│  │  Component   │  │  Component   │  │  Component   │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         │                  │                  │                 │
│  ┌──────▼──────────────────▼──────────────────▼───────┐        │
│  │           AuthContext & API Service                │        │
│  │  • register(formData, file)                        │        │
│  │  • login(mobile, password)                         │        │
│  │  • updateLocation(locationData)                    │        │
│  └────────────────────────┬───────────────────────────┘        │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         BACKEND                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   API Routes                         │      │
│  │  POST   /auth/register                               │      │
│  │  POST   /auth/login                                  │      │
│  │  PUT    /users/update-location                       │      │
│  └────────────────────┬─────────────────────────────────┘      │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────┐      │
│  │              Middleware Layer                        │      │
│  │  • Authentication (JWT)                              │      │
│  │  • File Upload (Multer)                              │      │
│  │  • Validation                                        │      │
│  └────────────────────┬─────────────────────────────────┘      │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────┐      │
│  │               Controllers                            │      │
│  │  • auth.controller.js                                │      │
│  │  • user.controller.js                                │      │
│  └────────────────────┬─────────────────────────────────┘      │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────┐      │
│  │                 Services                             │      │
│  │  • Cloudinary Upload                                 │      │
│  │  • JWT Token Generation                              │      │
│  │  • Password Hashing (bcrypt)                         │      │
│  └────────────────────┬─────────────────────────────────┘      │
│                       │                                         │
│  ┌────────────────────▼─────────────────────────────────┐      │
│  │              Models (Mongoose)                       │      │
│  │  • User Model                                        │      │
│  │  • AgronomistProfile Model                           │      │
│  │  • Media Model                                       │      │
│  └────────────────────┬─────────────────────────────────┘      │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        │
┌───────────────────────▼─────────────────────────────────────────┐
│                      DATABASES                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    MongoDB                           │      │
│  │  Collections:                                        │      │
│  │  • users                                             │      │
│  │    - Basic info (name, mobile, password)            │      │
│  │    - Location (GeoJSON Point)                       │      │
│  │    - Address (district, taluka)                     │      │
│  │  • agronomistprofiles                               │      │
│  │    - Qualification, experience                      │      │
│  │    - ID proof reference                             │      │
│  │    - Verification status                            │      │
│  │  • media                                             │      │
│  │    - Cloudinary URLs                                │      │
│  │    - Public IDs                                     │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  Cloudinary                          │      │
│  │  • Profile Photos                                    │      │
│  │  • ID Proof Documents                                │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  mobileNumber: String (unique, indexed),
  passwordHash: String,
  role: String (enum: ['farmer', 'admin', 'agronomist']),
  profilePhoto: ObjectId (ref: 'Media'),
  location: {
    type: String (default: 'Point'),
    coordinates: [Number] // [longitude, latitude]
  },
  address: {
    district: String,
    taluka: String
  },
  language: String (enum: ['en', 'hi', 'mr']),
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - mobileNumber: unique
// - location: 2dsphere (for geospatial queries)
```

### AgronomistProfile Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', unique),
  qualification: String,
  experience: Number,
  idProof: ObjectId (ref: 'Media'),
  status: String (enum: ['pending', 'verified', 'rejected']),
  availability: String (enum: ['available', 'unavailable']),
  bio: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - user: unique
// - status, availability: compound index
```

### Media Collection
```javascript
{
  _id: ObjectId,
  url: String,
  publicId: String,
  uploadedBy: ObjectId (ref: 'User'),
  contentType: String,
  size: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints Summary

### Authentication
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user (farmer/agronomist) |
| POST | `/api/v1/auth/login` | No | Login with mobile & password |
| POST | `/api/v1/auth/logout` | Yes | Logout and invalidate tokens |
| POST | `/api/v1/auth/refresh-token` | No | Refresh access token |

### User Management
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/users/me` | Yes | Get current user profile |
| PUT | `/api/v1/users/update` | Yes | Update profile info |
| PUT | `/api/v1/users/update-location` | Yes | **Update user location** |
| PUT | `/api/v1/users/change-password` | Yes | Change password |
| POST | `/api/v1/users/upload-photo` | Yes | Upload profile photo |
| DELETE | `/api/v1/users/delete-photo` | Yes | Delete profile photo |

## Technology Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM
- **State Management**: Context API
- **HTTP Client**: Axios
- **Maps**: React Leaflet + Leaflet
- **Styling**: Tailwind CSS
- **i18n**: react-i18next
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Validation**: express-validator (optional)

### External Services
- **Map Tiles**: OpenStreetMap
- **Geocoding**: Nominatim API
- **File Storage**: Cloudinary
- **Database**: MongoDB Atlas (or local)

## Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (salt rounds: 10)
   - Never stored in plain text
   - Never returned in API responses

2. **Authentication**
   - JWT-based authentication
   - Access tokens (15 min expiry)
   - Refresh tokens (30 days expiry)
   - Token stored in localStorage

3. **Authorization**
   - Role-based access control
   - Protected routes with middleware
   - Agronomist verification required

4. **Input Validation**
   - Mobile number format validation
   - File type validation for uploads
   - Coordinate validation for location
   - XSS protection

5. **File Upload Security**
   - File size limits
   - File type restrictions
   - Cloudinary secure upload
   - Virus scanning (recommended for production)

---

**Last Updated**: February 16, 2026
