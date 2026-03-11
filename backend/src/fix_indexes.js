import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krishi_kavach');
        console.log('Connected to DB');
        
        const coll = mongoose.connection.collection('expertchats');
        
        // List all indexes
        const before = await coll.indexes();
        console.log('\nCurrent indexes:');
        before.forEach(idx => console.log(' -', idx.name, JSON.stringify(idx.key), idx.unique ? '(unique)' : ''));
        
        // Drop the old index that doesn't include category
        for (const idx of before) {
            if (idx.name !== '_id_' && !idx.name.includes('category')) {
                console.log(`\nDropping stale index: ${idx.name}`);
                try {
                    await coll.dropIndex(idx.name);
                    console.log('Dropped successfully!');
                } catch (e) {
                    console.log('Could not drop (may not exist):', e.message);
                }
            }
        }
        
        // Ensure the correct composite index exists
        await coll.createIndex(
            { farmerId: 1, agronomistId: 1, category: 1 },
            { unique: true, background: true }
        );
        console.log('\nCorrect index created: farmerId+agronomistId+category (unique)');
        
        // Show final state
        const after = await coll.indexes();
        console.log('\nFinal indexes:');
        after.forEach(idx => console.log(' -', idx.name, JSON.stringify(idx.key), idx.unique ? '(unique)' : ''));
        
        mongoose.disconnect();
        console.log('\nDone!');
    } catch (err) {
        console.error('Index fix failed:', err);
        mongoose.disconnect();
        process.exit(1);
    }
};

fixIndexes();
