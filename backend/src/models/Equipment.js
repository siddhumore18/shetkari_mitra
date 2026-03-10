import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide the equipment name']
    },
    type: {
        type: String,
        enum: {
            values: ['Tractor', 'Harvester', 'Cultivator', 'Water Pump', 'Sprayer', 'Plow', 'Rotavator', 'Other'],
            message: 'Invalid equipment type'
        },
        required: [true, 'Please specify the equipment type']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a rental price']
    },
    priceUnit: {
        type: String,
        enum: ['per hour', 'per day', 'per acre'],
        default: 'per day'
    },
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        district: String
    },
    condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Needs Repair'],
        default: 'Good'
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    images: [{
        public_id: String,
        url: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for geospatial queries
equipmentSchema.index({ location: '2dsphere' });

// Add owner details virtually if needed
equipmentSchema.virtual('ownerDetails', {
    ref: 'User',
    localField: 'owner',
    foreignField: '_id',
    justOne: true
});

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
