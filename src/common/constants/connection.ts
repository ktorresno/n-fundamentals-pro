import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';

export type Connection = {
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

export const CONNECTION_TOKEN = 'CONNECTION';
export const PORT_CONFIG_TOKEN = 'PORT_CONFIG';

export const connectionProvider: Provider = {
  provide: CONNECTION_TOKEN,
  useFactory: (config: ConfigService): Connection =>
    getConnectionFromConfig(config),
  inject: [ConfigService],
};

export const portConfigProvider: Provider = {
  provide: PORT_CONFIG_TOKEN,
  useFactory: (config: ConfigService) => {
    const defaultPort =
      config.get<string>('NODE_ENV') === 'development'
        ? devConfig.port
        : proConfig.port;
    const port = config.get<number>('PORT') ?? defaultPort;
    return { port };
  },
  inject: [ConfigService],
};
console.log(
  '****** NODE_ENV:',
  process.env.NODE_ENV,
  'defaultPort:',
  process.env.NODE_ENV === 'development' ? devConfig.port : proConfig.port,
);
export const portConfig =
  process.env['NODE_ENV'] === 'development' ? devConfig : proConfig;
