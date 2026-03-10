import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete Processing Centers that are fallbacks
        const deletedCenters = await mongoose.connection.collection('processingcenters').deleteMany({
            $or: [
                { externalId: { $in: ['fallback_1', 'scr_1', 'scr_2', 'scr_3'] } },
                { source: { $in: ['Fallback', 'Scraped/IndiaMart', 'Scraped/TradeIndia', 'Scraped/Directories'] } }
            ]
        });
        console.log(`Deleted ${deletedCenters.deletedCount} fallback processing centers`);

        // Optionally delete listings that were created for testing (if any)
        // For now, only delete centers as requested.

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (err) {
        console.error(err);
    }
}

cleanup();
