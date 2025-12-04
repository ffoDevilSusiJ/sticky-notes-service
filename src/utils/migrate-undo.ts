import umzug from './migrate.js';
import sequelize from '../config/database.js';

async function undoMigration() {
  try {
    console.log('Откат последней миграции...');
    await umzug.down();
    console.log('Миграция отменена');
    await sequelize.close();
  } catch (error) {
    console.error('Ошибка отката:', error);
    process.exit(1);
  }
}

undoMigration();
