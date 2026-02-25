import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env using native Node.js feature (v20.6+)
try {
    process.loadEnvFile(path.join(__dirname, '../.env'));
} catch (e) {
    console.log('Note: Native process.loadEnvFile failed, searching for .env manually');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'vitquay';

async function seedAdmin() {
    if (!uri) {
        console.error('Error: MONGODB_URI is not defined in .env file or environment');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const usersCollection = db.collection('users');

        // Super Admin details
        const adminPhone = '0969606095';
        const adminPassword = 'admin123';
        const adminName = 'Super Admin';

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({ phone: adminPhone });

        if (existingAdmin) {
            console.log(`Admin with phone ${adminPhone} already exists.`);

            // Update role to super_admin just in case
            await usersCollection.updateOne(
                { _id: existingAdmin._id },
                { $set: { role: 'super_admin', is_deleted: false } }
            );
            console.log('Ensure role set to super_admin and active status');
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const newAdmin = {
                user_id: 'admin_' + Date.now(),
                phone: adminPhone,
                name: adminName,
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'super_admin',
                email_verified: true,
                is_deleted: false,
                created_at: new Date(),
                last_login: null
            };

            await usersCollection.insertOne(newAdmin);
            console.log('--------------------------------------------------');
            console.log('Super admin created successfully!');
            console.log(`Phone: ${adminPhone}`);
            console.log(`Password: ${adminPassword}`);
            console.log('--------------------------------------------------');
        }

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

seedAdmin();
