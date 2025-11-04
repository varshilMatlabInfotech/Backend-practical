import dotenv from 'dotenv';
import http from 'http';
import app from './src/app.js';
import connectDB from './src/db/config.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  //connect to database
  await connectDB();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
