import { ConfigService } from '@nestjs/config';

export type Connection = {
  CONNECTION_STRING: string;
  DB: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  BD_PORT: number;
  DB_HOST: string;
  DB_SYNC: boolean;
  DB_LOADENTITIES: boolean;
};

// Base defaults used when env/config values are absent
export const defaultConnection: Connection = {
  CONNECTION_STRING: 'MYSQL://1234/nest',
  DB: 'postgres',
  DB_NAME: 'TestDB',
  DB_USER: '',
  DB_PASSWORD: '',
  BD_PORT: 5432,
  DB_HOST: 'localhost',
  DB_SYNC: false,
  DB_LOADENTITIES: false,
};

// Build Connection from either a Nest ConfigService or process.env
export function getConnectionFromConfig(config?: ConfigService): Connection {
  const get = (key: string, fallback: string) =>
    config ? config.get<string>(key, fallback) : (process.env[key] ?? fallback);

  return {
    CONNECTION_STRING: get(
      'CONNECTION_STRING',
      defaultConnection.CONNECTION_STRING,
    ),
    DB: get('DB_TYPE', defaultConnection.DB),
    DB_NAME: get('DB_NAME', defaultConnection.DB_NAME),
    DB_USER: get('DB_USER', defaultConnection.DB_USER),
    DB_PASSWORD: get('DB_PASSWORD', defaultConnection.DB_PASSWORD),
    BD_PORT: Number.parseInt(
      get('DB_PORT', String(defaultConnection.BD_PORT)),
      10,
    ),
    DB_HOST: get('DB_HOST', defaultConnection.DB_HOST),
    DB_SYNC:
      get('DB_SYNCHRONIZE', String(defaultConnection.DB_SYNC)) === 'true',
    DB_LOADENTITIES:
      get('DB_AUTOLOADENTITIES', String(defaultConnection.DB_LOADENTITIES)) ===
      'true',
  };
}

const devConfig = { port: 3000 };
const proConfig = { port: 4000 };

export const portConfig =
  process.env.NODE_ENV === 'development' ? devConfig : proConfig;

/*export const connection: Connection = {
  CONNECTION_STRING: 'MYSQL://1234/nest',
  DB: process.env.DB_TYPE || 'postgres',
  DB_NAME: process.env.DB_NAME || 'TestDB',
  DB_USER: process.env.DB_USER || '',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  BD_PORT: Number.parseInt(process.env.DB_PORT || '5432', 10),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_SYNC: process.env.DB_SYNCHRONIZE === 'true',
  DB_LOADENTITIES: process.env.DB_AUTOLOADENTITIES === 'true', // ⚠️ solo en desarrollo puede ser true
};

export type Connection = {
  CONNECTION_STRING: string;
  DB: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  BD_PORT: number;
  DB_HOST?: string;
  DB_SYNC?: boolean;
  DB_LOADENTITIES?: boolean;
};*/
