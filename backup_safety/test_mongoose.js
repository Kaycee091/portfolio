import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    console.log('Connecting with mongoose to:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('Mongoose connected successfully to Atlas!');
    console.log('Connected DB Name:', mongoose.connection.name);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in', mongoose.connection.name, ':', collections.map(c => c.name));
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`  ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('Mongoose connection failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}
test();
