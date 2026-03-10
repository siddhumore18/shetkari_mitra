// Location Alert Test Script
// Copy and paste this into your browser console to test the location alert

console.log('🧪 LOCATION ALERT TEST SCRIPT');
console.log('================================\n');

// Test 1: Check if user is logged in
const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('✅ Test 1: User Login Status');
console.log('   User exists:', !!user);
console.log('   User role:', user?.role);
console.log('   User name:', user?.fullName);
console.log('');

// Test 2: Check location data
console.log('✅ Test 2: Location Data');
console.log('   Location object:', user?.location);
console.log('   Coordinates:', user?.location?.coordinates);
console.log('   District:', user?.address?.district);
console.log('   Taluka:', user?.address?.taluka);
console.log('');

// Test 3: Check localStorage flag
const hidePrompt = localStorage.getItem('hideLocationPrompt');
console.log('✅ Test 3: LocalStorage Flag');
console.log('   hideLocationPrompt:', hidePrompt);
console.log('');

// Test 4: Calculate hasLocation
const hasLocation = user?.location?.coordinates &&
    user.location.coordinates.length === 2 &&
    user.location.coordinates[0] !== 0 &&
    user.location.coordinates[1] !== 0 &&
    user.location.coordinates[0] !== undefined &&
    user.location.coordinates[1] !== undefined;

console.log('✅ Test 4: Location Detection');
console.log('   Has valid location:', hasLocation);
console.log('');

// Test 5: Should modal appear?
const shouldShowModal = !hidePrompt && !hasLocation && user?.role === 'farmer';
console.log('✅ Test 5: Modal Display Logic');
console.log('   Should show modal:', shouldShowModal);
console.log('');

// Test 6: Detailed breakdown
console.log('✅ Test 6: Detailed Breakdown');
console.log('   Conditions for modal to appear:');
console.log('   ├─ User is farmer:', user?.role === 'farmer', user?.role === 'farmer' ? '✓' : '✗');
console.log('   ├─ Not dismissed:', !hidePrompt, !hidePrompt ? '✓' : '✗');
console.log('   └─ No location:', !hasLocation, !hasLocation ? '✓' : '✗');
console.log('');

// Summary
console.log('📊 SUMMARY');
console.log('================================');
if (shouldShowModal) {
    console.log('✅ Modal SHOULD appear');
    console.log('   If it\'s not appearing, check:');
    console.log('   1. Is FarmerDashboard component mounted?');
    console.log('   2. Check React DevTools for showLocationPrompt state');
    console.log('   3. Look for JavaScript errors in console');
} else {
    console.log('❌ Modal should NOT appear');
    if (user?.role !== 'farmer') {
        console.log('   Reason: User is not a farmer');
    }
    if (hidePrompt) {
        console.log('   Reason: User dismissed it (hideLocationPrompt = true)');
        console.log('   Fix: Run localStorage.removeItem("hideLocationPrompt")');
    }
    if (hasLocation) {
        console.log('   Reason: Location is already set');
        console.log('   Coordinates:', user?.location?.coordinates);
    }
}
console.log('');

// Quick fixes
console.log('🔧 QUICK FIXES');
console.log('================================');
console.log('// Force show modal (clear dismiss flag):');
console.log('localStorage.removeItem("hideLocationPrompt"); location.reload();');
console.log('');
console.log('// Reset location to trigger modal:');
console.log('const u = JSON.parse(localStorage.getItem("user"));');
console.log('u.location = { type: "Point", coordinates: [0, 0] };');
console.log('u.address = { district: "", taluka: "" };');
console.log('localStorage.setItem("user", JSON.stringify(u));');
console.log('location.reload();');
console.log('');
console.log('================================');
console.log('Test complete! 🎉');
