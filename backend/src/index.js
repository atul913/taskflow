require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***@'));

    app.listen(PORT, () => {
      console.log(`🚀 TaskFlow API running on port ${PORT}`);
      console.log(`   Base path: http://localhost:${PORT}/bfhl/tasks`);
      console.log(`   Health:    http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('\n👋 Disconnected from MongoDB. Goodbye!');
  process.exit(0);
});

startServer();
