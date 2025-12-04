import { createServer } from 'http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initializeEventProcessor, stopEventProcessor } from './sockets/eventProcessor.js';
import { StickyNotesService } from './services/StickyNotesService.js';
import StickyNotesController from './controllers/StickyNotesController.js';
import { runMigrations } from './utils/migrate.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    await runMigrations();

    await initializeEventProcessor();

    const stickyNotesService = new StickyNotesService();
    StickyNotesController.setService(stickyNotesService);

    httpServer.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`Окружение: ${process.env.NODE_ENV || 'development'}`);
    });

    const gracefulShutdown = async () => {
      console.log('\nОстановка сервера...');
      httpServer.close(async () => {
        await stopEventProcessor();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();
