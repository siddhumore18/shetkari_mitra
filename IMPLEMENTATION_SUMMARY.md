# Registration and Location Update Implementation Summary

## Overview
This document summarizes the changes made to implement the new registration flow and location update functionality for the Krushi-kavach application.

## Changes Made

### Backend Changes

#### 1. Authentication Controller (`backend/src/controllers/auth.controller.js`)
**Changes:**
- Modified the `register` function to support simplified farmer registration
- Added validation for agronomist-specific fields (qualification, experience, location, ID proof)
- Made role default to 'farmer' if not provided
- Added location requirement validation for agronomists during registration
- Improved error messages for better user experience

**Key Features:**
- **Farmers**: Only need to provide full name, mobile number, and password
- **Agronomists**: Must provide:
  - Full name, mobile number, password
  - Location (latitude/longitude) - **REQUIRED**
  - Qualification - **REQUIRED**
  - Experience - **REQUIRED**
  - ID Proof upload - **REQUIRED**

#### 2. User Controller (`backend/src/controllers/user.controller.js`)
**Changes:**
- Added new `updateLocation` function to allow users to update their location after login
- Function accepts latitude, longitude, district, and taluka
- Updates the user's location coordinates and address in the database
- Returns the updated user object

#### 3. User Routes (`backend/src/routes/user.routes.js`)
**Changes:**
- Added new route: `PUT /api/v1/users/update-location`
- Route is protected by authentication middleware
- Allows both farmers and agronomists to update their location post-login

### Frontend Changes

#### 1. Registration Page (`frontend/src/pages/Register.jsx`)
**Changes:**
- Completely redesigned registration flow
- Role selection now determines which fields are shown
- **For Farmers:**
  - Basic fields: Full name, mobile number, password, role
  - Optional: Language preference
  - Map is NOT shown during registration (can be updated after login)
  
- **For Agronomists:**
  - Basic fields: Full name, mobile number, password, role
  - **Required additional fields:**
    - Interactive map for location selection (using Leaflet/OpenStreetMap)
    - Qualification
    - Experience (in years)
    - ID proof upload
  - Auto-populated: District and Taluka (via reverse geocoding)

**Validation:**
- Mobile number validation (10 digits, starts with 6-9)
- Password visibility toggle
- Form validation for required fields based on role
- Location validation for agronomists

#### 2. API Service (`frontend/src/services/api.js`)
**Changes:**
- Added `updateLocation` function to `userAPI` object
- Function sends PUT request to `/users/update-location` endpoint
- Accepts location data (latitude, longitude, district, taluka)

#### 3. Location Update Component (`frontend/src/components/LocationUpdate.jsx`)
**New Component Created:**
- Reusable component for updating location after login
- Features:
  - Interactive map using Leaflet and OpenStreetMap
  - Click on map to select precise location
  - Reverse geocoding to auto-fill district and taluka
  - Manual editing of district and taluka fields
  - Loading states and error handling
  - Success/error messaging
  - Responsive design

#### 4. User Profile Page (`frontend/src/pages/UserProfile.jsx`)
**Changes:**
- Added import for `LocationUpdate` component
- Added new "Location" tab in the profile navigation
- Integrated `LocationUpdate` component in the Location tab
- Component receives current location and updates profile on successful location update

## User Flow

### Registration Flow

#### Farmer Registration:
1. User visits registration page
2. Selects "Farmer" role (default)
3. Fills in:
   - Full name
   - Mobile number (10 digits)
   - Password
   - Language preference (optional)
4. Clicks "Register"
5. Redirected to login page
6. After login, can update location from Profile → Location tab

#### Agronomist Registration:
1. User visits registration page
2. Selects "Agronomist" role
3. Fills in:
   - Full name
   - Mobile number (10 digits)
   - Password
4. **Additional required steps:**
   - Clicks on map to select precise location
   - District and Taluka auto-filled (can be edited)
   - Enters qualification
   - Enters years of experience
   - Uploads ID proof document
5. Clicks "Register"
6. Account created with "pending" status
7. Redirected to login page
8. Can login only after admin verification
9. After login, can update location from Profile → Location tab

### Post-Login Location Update (Both Roles):
1. User logs in
2. Navigates to Profile page
3. Clicks on "Location" tab
4. Interactive map is displayed with current location (if set)
5. Clicks on map to select new location
6. District and Taluka auto-filled via reverse geocoding
7. Can manually edit district and taluka
8. Clicks "Update Location"
9. Location updated in database
10. Success message displayed

## Technical Details

### Map Integration:
- **Library**: React Leaflet
- **Tile Provider**: OpenStreetMap
- **Reverse Geocoding**: Nominatim API (OpenStreetMap)
- **Default Center**: India (20.5937°N, 78.9629°E)
- **Features**:
  - Click to select location
  - Marker shows selected location
  - Zoom controls
  - Scroll wheel zoom enabled
  - Responsive design

### Data Structure:
```javascript
// Location object in User model
location: {
  type: 'Point',
  coordinates: [longitude, latitude] // GeoJSON format
}

// Address object
address: {
  district: String,
  taluka: String
}
```

### API Endpoints:

#### Registration:
- **Endpoint**: `POST /api/v1/auth/register`
- **Content-Type**: `multipart/form-data` (for file upload)
- **Body**:
  ```javascript
  {
    fullName: String,
    mobileNumber: String,
    password: String,
    role: String, // 'farmer' or 'agronomist'
    language: String, // optional
    // For agronomists only:
    longitude: Number,
    latitude: Number,
    district: String,
    taluka: String,
    qualification: String,
    experience: Number,
    idProof: File
  }
  ```

#### Location Update:
- **Endpoint**: `PUT /api/v1/users/update-location`
- **Authentication**: Required (Bearer token)
- **Body**:
  ```javascript
  {
    longitude: Number,
    latitude: Number,
    district: String, // optional
    taluka: String    // optional
  }
  ```

## Validation Rules

### Mobile Number:
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Regex: `/^[6-9]\d{9}$/`

### Agronomist Registration:
- Qualification: Required, non-empty string
- Experience: Required, must be a number
- Location: Required, must have valid latitude and longitude
- ID Proof: Required, must be a file

### Location Update:
- Latitude: Required, must be a valid number
- Longitude: Required, must be a valid number
- District: Optional
- Taluka: Optional

## Security Considerations

1. **Authentication**: All location update endpoints require valid JWT token
2. **File Upload**: ID proof upload uses Cloudinary with secure upload
3. **Password Hashing**: Passwords are hashed using bcrypt before storage
4. **Input Validation**: All inputs are validated on both frontend and backend
5. **Role-based Access**: Agronomists can only login after admin verification

## Testing Checklist

### Farmer Registration:
- [ ] Can register with only basic info (name, mobile, password)
- [ ] Mobile number validation works correctly
- [ ] Password visibility toggle works
- [ ] Language selection works
- [ ] Redirects to login after successful registration
- [ ] Can login immediately after registration

### Agronomist Registration:
- [ ] Role selection shows additional fields
- [ ] Map is displayed and interactive
- [ ] Clicking map updates coordinates
- [ ] Reverse geocoding populates district/taluka
- [ ] Can manually edit district/taluka
- [ ] Qualification field is required
- [ ] Experience field is required and accepts numbers only
- [ ] ID proof upload is required
- [ ] Cannot submit without all required fields
- [ ] Redirects to login after successful registration
- [ ] Cannot login until admin verifies account

### Location Update (Post-Login):
- [ ] Location tab is visible in profile
- [ ] Map displays current location if set
- [ ] Can click map to select new location
- [ ] Reverse geocoding works
- [ ] Can manually edit district/taluka
- [ ] Update button is disabled without location
- [ ] Success message shown on successful update
- [ ] Error message shown on failure
- [ ] Profile updates with new location

## Future Enhancements

1. **GPS Location**: Add "Use Current Location" button to auto-detect user's location
2. **Search**: Add location search functionality
3. **Multiple Locations**: Allow farmers to add multiple farm locations
4. **Location History**: Track location update history
5. **Map Providers**: Add option to switch between map providers (Google Maps, Mapbox)
6. **Offline Support**: Cache map tiles for offline access
7. **Location Verification**: Add location verification for agronomists

## Dependencies

### Backend:
- `mongoose`: Database ORM
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `multer`: File upload handling
- `cloudinary`: Cloud storage for files
- `express-async-handler`: Async error handling

### Frontend:
- `react`: UI library
- `react-router-dom`: Routing
- `react-leaflet`: Map component
- `leaflet`: Map library
- `axios`: HTTP client
- `react-i18next`: Internationalization

## Notes

1. **OpenStreetMap Usage**: The application uses OpenStreetMap tiles which are free but have usage limits. For production, consider using a paid tile provider or self-hosting tiles.

2. **Reverse Geocoding**: Nominatim API has rate limits. For production, consider using a paid geocoding service or implementing caching.

3. **Location Privacy**: Consider adding privacy settings to allow users to control who can see their location.

4. **Mobile Responsiveness**: All components are fully responsive and work on mobile devices.

5. **Browser Compatibility**: Tested on modern browsers (Chrome, Firefox, Safari, Edge).

## Deployment Notes

1. Ensure environment variables are set:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`

2. Frontend environment variables:
   - `VITE_API_URL`: Backend API URL

3. Database indexes:
   - Ensure 2dsphere index exists on `location` field in User model

4. CORS configuration:
   - Ensure frontend domain is whitelisted in backend CORS settings

## Support

For issues or questions, please contact the development team or create an issue in the project repository.

---

**Last Updated**: February 16, 2026
**Version**: 1.0.0
