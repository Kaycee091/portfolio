import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing Atlas connection with URI:', uri.replace(/:([^:@]+)@/, ':****@'));

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

async function check() {
  try {
    await client.connect();
    console.log('Connected to Atlas successfully!');
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases on Atlas:', dbs.databases.map(d => d.name));
    for (const d of dbs.databases) {
      if (['admin', 'local', 'config'].includes(d.name)) continue;
      const collections = await client.db(d.name).listCollections().toArray();
      console.log(`Database [${d.name}] collections:`, collections.map(c => c.name));
      for (const col of collections) {
        const count = await client.db(d.name).collection(col.name).countDocuments();
        console.log(`   Collection ${col.name}: ${count} docs`);
      }
    }
  } catch (err) {
    console.error('Atlas connection error:', err.message);
  } finally {
    await client.close();
  }
}

check();
