// Set environment variables before importing other modules
process.env.NODE_ENV = 'development';
process.env.MONGOMS_DOWNLOAD_TIMEOUT = '300000';
process.env.MONGOMS_SPAWN_TIMEOUT = '300000';
process.env.MONGOMS_DEBUG = '1';

import { MongoMemoryServer } from 'mongodb-memory-server';

async function start() {
  console.log('Starting MongoMemoryServer...');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log('MongoMemoryServer started at:', uri);
  
  // Set the environment variable before importing index.js
  process.env.MONGODB_URL = uri;
  
  console.log('Bootstrapping application server...');
  require('./index.js');

  // Wait for the server to be listening and database connected
  setTimeout(() => {
    console.log('Launching verification test client...');
    try {
      require('/Users/pcmanish/.gemini/antigravity-ide/brain/7c6e6c3d-7fc2-48a6-bed9-001a6d14b107/scratch/test_friend_api.js');
    } catch (e) {
      console.error('Error loading test client:', e);
      process.exit(1);
    }
  }, 5000);
}

start().catch((err) => {
  console.error('Failed to start test runner:', err);
  process.exit(1);
});
