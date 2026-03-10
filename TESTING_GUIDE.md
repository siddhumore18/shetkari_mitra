# Testing Guide for Registration and Location Updates

## Quick Start

### Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend server running on `http://localhost:5173` (or your configured port)
- MongoDB connected
- Cloudinary configured

## Test Scenarios

### 1. Test Farmer Registration (Simplified Flow)

**Steps:**
1. Navigate to `http://localhost:5173/register`
2. Fill in the following fields:
   - Full Name: `Test Farmer`
   - Mobile Number: `9876543210`
   - Password: `testpassword123`
   - Role: Select `Farmer` (should be default)
   - Language: Select any (optional)
3. Click "Register"
4. Should redirect to login page
5. Login with the credentials
6. Should be able to access farmer dashboard

**Expected Results:**
- ✅ Registration succeeds with only basic info
- ✅ No map or additional fields required
- ✅ Can login immediately after registration
- ✅ User role is 'farmer'

### 2. Test Agronomist Registration (Complete Flow)

**Steps:**
1. Navigate to `http://localhost:5173/register`
2. Fill in basic fields:
   - Full Name: `Dr. Test Agronomist`
   - Mobile Number: `9123456789`
   - Password: `testpassword123`
   - Role: Select `Agronomist`
3. Additional fields should appear:
   - **Location Selection:**
     - Click on the map to select a location
     - Verify coordinates are displayed
     - Check if district/taluka are auto-filled
   - **Qualification:** `Ph.D. in Agriculture`
   - **Experience:** `10`
   - **ID Proof:** Upload any image/PDF file
4. Click "Register"
5. Should redirect to login page
6. Try to login - should fail with "waiting for admin approval" message

**Expected Results:**
- ✅ Additional fields appear when agronomist role is selected
- ✅ Map is interactive and shows selected location
- ✅ Reverse geocoding populates district/taluka
- ✅ Cannot submit without all required fields
- ✅ File upload works
- ✅ Registration succeeds
- ✅ Cannot login until admin verifies

**Admin Verification (Required for Agronomist Login):**
1. Login as admin
2. Navigate to agronomist management
3. Verify the newly registered agronomist
4. Now the agronomist should be able to login

### 3. Test Location Update (Farmer)

**Steps:**
1. Login as a farmer
2. Navigate to Profile page
3. Click on "Location" tab
4. Click on the map to select a location
5. Verify coordinates are displayed
6. Check if district/taluka are auto-filled
7. Optionally edit district/taluka manually
8. Click "Update Location"
9. Verify success message appears
10. Refresh the page and verify location persists

**Expected Results:**
- ✅ Location tab is visible
- ✅ Map is interactive
- ✅ Can select location by clicking map
- ✅ Reverse geocoding works
- ✅ Can manually edit address fields
- ✅ Update succeeds
- ✅ Location persists after refresh

### 4. Test Location Update (Agronomist)

**Steps:**
1. Login as a verified agronomist
2. Navigate to Profile page
3. Click on "Location" tab
4. Should see current location (set during registration)
5. Click on a different location on the map
6. Update district/taluka if needed
7. Click "Update Location"
8. Verify success message appears
9. Refresh and verify new location is displayed

**Expected Results:**
- ✅ Current location is displayed on map
- ✅ Can update to a new location
- ✅ Update succeeds
- ✅ New location persists

### 5. Test Validation

**Mobile Number Validation:**
- Try: `123` - Should show "Must be 10 digits"
- Try: `1234567890` - Should show "Must start with 6-9"
- Try: `9876543210` - Should pass ✅

**Agronomist Required Fields:**
- Try submitting without location - Should show error
- Try submitting without qualification - Should show error
- Try submitting without experience - Should show error
- Try submitting without ID proof - Should show error

**Location Update:**
- Try updating without selecting location - Button should be disabled

### 6. Test Error Handling

**Network Error:**
1. Stop the backend server
2. Try to register - Should show error message
3. Try to update location - Should show error message

**Invalid Data:**
1. Try to register with existing mobile number - Should show "Mobile number already registered"
2. Try to update location with invalid coordinates - Should show error

### 7. Test Responsive Design

**Mobile View:**
1. Open browser DevTools
2. Switch to mobile view (iPhone, Android)
3. Test registration form
4. Test location update
5. Verify map is usable on mobile
6. Verify all buttons are accessible

**Expected Results:**
- ✅ Form is responsive
- ✅ Map is usable on mobile
- ✅ All features work on mobile

## API Testing (Using Postman/Thunder Client)

### 1. Register Farmer
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Test Farmer",
  "mobileNumber": "9876543210",
  "password": "testpassword123",
  "role": "farmer",
  "language": "en"
}
```

**Expected Response:**
```json
{
  "message": "Registered successfully.",
  "user": {
    "_id": "...",
    "fullName": "Test Farmer",
    "mobileNumber": "9876543210",
    "role": "farmer",
    "language": "en",
    ...
  }
}
```

### 2. Register Agronomist
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: multipart/form-data

fullName: Dr. Test Agronomist
mobileNumber: 9123456789
password: testpassword123
role: agronomist
language: en
longitude: 78.9629
latitude: 20.5937
district: Test District
taluka: Test Taluka
qualification: Ph.D. in Agriculture
experience: 10
idProof: [file upload]
```

**Expected Response:**
```json
{
  "message": "Registration successful. Your profile is now pending verification.",
  "user": {
    "_id": "...",
    "fullName": "Dr. Test Agronomist",
    "mobileNumber": "9123456789",
    "role": "agronomist",
    ...
  }
}
```

### 3. Update Location
```http
PUT http://localhost:5000/api/v1/users/update-location
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "longitude": 77.5946,
  "latitude": 12.9716,
  "district": "Bangalore Urban",
  "taluka": "Bangalore North"
}
```

**Expected Response:**
```json
{
  "message": "Location updated successfully",
  "user": {
    "_id": "...",
    "location": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "address": {
      "district": "Bangalore Urban",
      "taluka": "Bangalore North"
    },
    ...
  }
}
```

## Common Issues and Solutions

### Issue 1: Map not loading
**Solution:** Check browser console for errors. Ensure Leaflet CSS is imported.

### Issue 2: Reverse geocoding not working
**Solution:** Check network tab for Nominatim API calls. May be rate-limited. Wait a few seconds and try again.

### Issue 3: File upload failing
**Solution:** Check Cloudinary credentials in backend `.env` file.

### Issue 4: Location not persisting
**Solution:** Check MongoDB connection and ensure 2dsphere index exists on location field.

### Issue 5: Cannot login as agronomist
**Solution:** Verify the agronomist account status is 'verified' in the database or through admin panel.

## Database Verification

### Check User in MongoDB:
```javascript
// In MongoDB shell or Compass
db.users.findOne({ mobileNumber: "9876543210" })
```

**Expected Fields:**
```javascript
{
  "_id": ObjectId("..."),
  "fullName": "Test Farmer",
  "mobileNumber": "9876543210",
  "passwordHash": "$2a$10$...", // Hashed
  "role": "farmer",
  "language": "en",
  "location": {
    "type": "Point",
    "coordinates": [78.9629, 20.5937]
  },
  "address": {
    "district": "Test District",
    "taluka": "Test Taluka"
  },
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Check Agronomist Profile:
```javascript
db.agronomistprofiles.findOne({ user: ObjectId("...") })
```

**Expected Fields:**
```javascript
{
  "_id": ObjectId("..."),
  "user": ObjectId("..."),
  "qualification": "Ph.D. in Agriculture",
  "experience": 10,
  "idProof": ObjectId("..."), // Reference to Media
  "status": "pending", // or "verified"
  "availability": "available",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

## Performance Testing

### Test with Multiple Users:
1. Register 10 farmers
2. Register 5 agronomists
3. Have all users update their locations
4. Verify no performance degradation
5. Check database query performance

### Load Testing (Optional):
Use tools like Apache JMeter or Artillery to test:
- 100 concurrent registrations
- 100 concurrent location updates
- Verify response times are acceptable

## Security Testing

### Test Authentication:
1. Try to update location without token - Should fail with 401
2. Try to update location with invalid token - Should fail with 401
3. Try to update location with expired token - Should refresh or fail

### Test Authorization:
1. Try to access admin endpoints as farmer - Should fail with 403
2. Try to access agronomist endpoints as farmer - Should fail with 403

### Test Input Validation:
1. Try SQL injection in mobile number field
2. Try XSS in name field
3. Try uploading malicious file as ID proof
4. All should be properly sanitized/rejected

## Accessibility Testing

### Keyboard Navigation:
1. Navigate through registration form using only Tab key
2. Submit form using Enter key
3. Verify all interactive elements are accessible

### Screen Reader:
1. Test with NVDA or JAWS
2. Verify all form labels are read correctly
3. Verify error messages are announced

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (Chrome, Safari)

## Final Checklist

- [ ] Farmer registration works with minimal fields
- [ ] Agronomist registration requires all fields including location
- [ ] Map is interactive and displays correctly
- [ ] Reverse geocoding populates address fields
- [ ] File upload works for ID proof
- [ ] Location update works for both roles
- [ ] Validation works correctly
- [ ] Error messages are clear and helpful
- [ ] Success messages are displayed
- [ ] Data persists in database
- [ ] Mobile responsive design works
- [ ] All API endpoints return correct responses
- [ ] Authentication and authorization work correctly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance is acceptable

---

**Happy Testing! 🎉**
