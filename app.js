require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConnect = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const friendsRoutes = require('./routes/friends.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api', authRoutes);
app.use('/api', friendsRoutes);

// error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
  await dbConnect();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
