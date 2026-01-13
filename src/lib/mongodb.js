import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  // useUnifiedTopology: true,
  // useNewUrlParser: true,
};

let client;
let clientPromise;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Return a rejected promise when MONGODB_URI is not available
  clientPromise = Promise.reject(
    new Error('MONGODB_URI environment variable is not set')
  );
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Get database name from environment variable or use default
 * Có thể cấu hình trong .env.local: MONGODB_DB_NAME=your-database-name
 * Nếu không có, mặc định là 'uk-restaurant'
 */
export function getDatabaseName() {
  return process.env.MONGODB_DB_NAME || 'uk-restaurant';
}

