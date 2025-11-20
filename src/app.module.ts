import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './songs/songs.module';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { SongsController } from './songs/songs.controller';
import { DevConfigService } from './common/providers/DevConfigService';
import {
  getConnectionFromConfig,
  portConfigProvider,
} from './common/constants/connection';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const cfg = getConnectionFromConfig(configService);
        return {
          type: 'postgres',
          host: cfg.DB_HOST,
          port: cfg.BD_PORT,
          username: cfg.DB_USER,
          password: cfg.DB_PASSWORD,
          database: cfg.DB_NAME,
          autoLoadEntities: cfg.DB_LOADENTITIES,
          synchronize: cfg.DB_SYNC,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        };
      },
    }),
    PlaylistsModule,
    SongsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //DevConfigService,
    {
      provide: DevConfigService,
      useClass: DevConfigService,
    },
    {
      provide: 'PORT_CONFIG',
      //useValue: { port: '3000' },
      useFactory: () => portConfigProvider,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    @Inject('PORT_CONFIG') private readonly portConfig: { port: number },
  ) {
    console.log(
      'Data Source has been initialized!... Database: ',
      dataSource.driver.database,
    );

    //const port = this.configService.get<number>('PORT') || this.portConfig.port;
    console.log('... Port: ', this.portConfig.port);
  }
  configure(consumer: MiddlewareConsumer) {
    // Apply to all services into songs route
    // Option 1
    // consumer.apply(LoggerMiddleware).forRoutes('songs');
    // Option 2
    consumer.apply(LoggerMiddleware).forRoutes(SongsController);
    // Option 3
    // Only apply to a specific Http method in a route
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: 'songs', method: RequestMethod.POST }); // Apply to all services into all routes
  }
}
