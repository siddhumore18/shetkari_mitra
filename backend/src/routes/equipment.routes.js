import express from 'express';
import { createEquipment, getNearbyEquipment, getMyEquipment, updateEquipment } from '../controllers/equipment.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all equipment routes
router.use(protect);

// Get nearby equipment (Available to all authenticated users)
router.get('/nearby', getNearbyEquipment);

// Manage my listings (Farmers only)
router.get('/my-listings', authorizeRoles('farmer'), getMyEquipment);

router
    .route('/')
    .post(authorizeRoles('farmer'), createEquipment);

router
    .route('/:id')
    .patch(authorizeRoles('farmer'), updateEquipment);

export default router;
