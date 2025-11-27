import { ConfigService } from '@nestjs/config';
import {
  getConnectionFromConfig,
  defaultConnection,
  portConfigProvider,
  connectionProvider,
  PORT_CONFIG_TOKEN,
} from './connection';

describe('Connection Constants', () => {
  describe('getConnectionFromConfig', () => {
    it('should return default connection when config is not provided', () => {
      const connection = getConnectionFromConfig();
      expect(connection).toEqual({
        ...defaultConnection,
        DB_SYNC: false,
        DB_LOADENTITIES: false,
      });
    });

    it('should return connection from config service', () => {
      const configService = {
        get: jest.fn((key, fallback) => {
          if (key === 'DB_TYPE') return 'mysql';
          if (key === 'DB_PORT') return '3306';
          if (key === 'DB_SYNCHRONIZE') return 'true';
          return fallback;
        }),
      } as unknown as ConfigService;

      const connection = getConnectionFromConfig(configService);
      expect(connection.DB).toBe('mysql');
      expect(connection.BD_PORT).toBe(3306);
      expect(connection.DB_SYNC).toBe(true);
    });
  });

  describe('portConfigProvider', () => {
    it('should provide port config', () => {
      const configService = {
        get: jest.fn((key) => {
          if (key === 'NODE_ENV') return 'development';
          if (key === 'PORT') return 3000;
          return null;
        }),
      } as unknown as ConfigService;

      const provider = (portConfigProvider as any).useFactory(configService);
      expect(provider).toEqual({ port: 3000 });
    });
  });

  describe('connectionProvider', () => {
    it('should provide connection config', () => {
      const configService = {
        get: jest.fn((key) => {
          if (key === 'DB_TYPE') return 'postgres';
          return null;
        }),
      } as unknown as ConfigService;

      const provider = (connectionProvider as any).useFactory(configService);
      expect(provider.DB).toBe('postgres');
    });
  });
});
