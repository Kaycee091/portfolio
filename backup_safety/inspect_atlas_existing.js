import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function inspectAtlas() {
  try {
    await client.connect();
    const db = client.db('test');
    const collections = await db.listCollections().toArray();
    
    const atlasExport = {};
    for (const col of collections) {
      const docs = await db.collection(col.name).find({}).toArray();
      atlasExport[col.name] = docs;
      console.log(`\n================ Collection: ${col.name} (${docs.length} docs) ================`);
      console.log(JSON.stringify(docs.slice(0, 3), null, 2));
    }

    fs.writeFileSync('backup_safety/existing_atlas_data.json', JSON.stringify(atlasExport, null, 2));
    console.log('\nExported existing Atlas data to backup_safety/existing_atlas_data.json');
  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await client.close();
  }
}

inspectAtlas();
