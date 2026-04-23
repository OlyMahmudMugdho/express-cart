import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  entities: ['dist/**/*.entity.js'],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    connectionTimeoutMillis: 30000,
  },
});