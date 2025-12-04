import { createServer } from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initializeEventProcessor, stopEventProcessor } from './sockets/eventProcessor.js';
import { StickyNotesService } from './services/StickyNotesService.js';
import StickyNotesController from './controllers/StickyNotesController.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    await initializeEventProcessor();

    const stickyNotesService = new StickyNotesService();
    StickyNotesController.setService(stickyNotesService);

    httpServer.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const gracefulShutdown = async () => {
      console.log('\n⏳ Shutting down gracefully...');
      httpServer.close(async () => {
        await stopEventProcessor();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
