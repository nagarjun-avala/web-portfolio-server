
import { MongoClient } from 'mongodb';
import "dotenv/config";

const cleanDb = async () => {
    let client: MongoClient | null = null;
    try {
        const url = process.env.DATABASE_URL;
        if (!url) {
            console.error("❌ DATABASE_URL is missing.");
            return;
        }

        client = new MongoClient(url);
        await client.connect();
        const db = client.db();

        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`✅ Dropped collection: ${collection.name}`);
        }

        console.log("🚀 Database cleaned successfully.");
    } catch (error) {
        console.error("❌ Error cleaning database:", error);
    } finally {
        if (client) await client.close();
    }
};

cleanDb();
