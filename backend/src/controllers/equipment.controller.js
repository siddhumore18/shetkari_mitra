import Equipment from '../models/Equipment.js';

// @desc    Create new equipment listing
// @route   POST /api/v1/equipment
// @access  Private (Farmer only)
export const createEquipment = async (req, res) => {
    try {
        const equipData = {
            ...req.body,
            owner: req.user._id,
        };

        // Set location from user if not provided
        if (!equipData.location && req.user.location && req.user.location.coordinates?.length === 2) {
            equipData.location = {
                type: 'Point',
                coordinates: req.user.location.coordinates,
                address: req.user.address || '',
                district: req.user.district || ''
            };
        }

        const equipment = await Equipment.create(equipData);

        res.status(201).json({
            status: 'success',
            data: equipment
        });
    } catch (err) {
        console.error('Error creating equipment:', err);
        res.status(400).json({ message: 'Failed to create equipment listing', error: err.message });
    }
};

// @desc    Get nearby equipment
// @route   GET /api/v1/equipment/nearby
// @access  Private
export const getNearbyEquipment = async (req, res) => {
    try {
        if (!req.user.location || !req.user.location.coordinates || req.user.location.coordinates.length !== 2) {
            return res.status(400).json({ message: 'Your location is not set. Please update your profile.' });
        }

        const [lng, lat] = req.user.location.coordinates;
        const radius = req.query.radius ? parseInt(req.query.radius) : 50; // default 50km
        const type = req.query.type;

        // Find equipment within radius
        const query = {
            isAvailable: true,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            }
        };

        if (type) query.type = type;

        const equipment = await Equipment.find(query).populate('owner', 'fullName mobileNumber profilePhoto');

        res.status(200).json({
            status: 'success',
            results: equipment.length,
            data: equipment
        });
    } catch (err) {
        console.error('Error fetching nearby equipment:', err);
        res.status(500).json({ message: 'Failed to fetch nearby equipment', error: err.message });
    }
};

// @desc    Get my equipment listings
// @route   GET /api/v1/equipment/my-listings
// @access  Private (Farmer only)
export const getMyEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.find({ owner: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: equipment.length,
            data: equipment
        });
    } catch (err) {
        console.error('Error fetching my equipment:', err);
        res.status(500).json({ message: 'Failed to fetch your equipment listings', error: err.message });
    }
};

// @desc    Update equipment listing (e.g. toggle availability)
// @route   PATCH /api/v1/equipment/:id
// @access  Private (Owner only)
export const updateEquipment = async (req, res) => {
    try {
        // Find and verify ownership
        const equipment = await Equipment.findOne({ _id: req.params.id, owner: req.user._id });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found or you are not authorized to update it' });
        }

        const allowedUpdates = ['name', 'type', 'price', 'priceUnit', 'condition', 'description', 'isAvailable'];
        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: updatedEquipment
        });
    } catch (err) {
        console.error('Error updating equipment:', err);
        res.status(400).json({ message: 'Failed to update equipment listing', error: err.message });
    }
};
