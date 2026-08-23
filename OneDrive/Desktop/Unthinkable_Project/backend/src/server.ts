import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  try {
    // Connect to MongoDB Database
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`==================================================`);
      console.log(` MediBridge Backend Server Listening on Port ${env.PORT}`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` Healthcheck: http://localhost:${env.PORT}/health`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
