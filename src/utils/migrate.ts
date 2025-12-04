import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from '../config/database.js';

const umzug = new Umzug({
  migrations: {
    glob: 'migrations/*.js',
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export type Migration = typeof umzug._types.migration;

export async function runMigrations() {
  try {
    console.log('Запуск миграций...');
    const migrations = await umzug.up();

    if (migrations.length === 0) {
      console.log('Новых миграций нет');
    } else {
      console.log(`Выполнено миграций: ${migrations.length}`);
      migrations.forEach((m) => console.log(`  - ${m.name}`));
    }
  } catch (error) {
    console.error('Ошибка миграции:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default umzug;
