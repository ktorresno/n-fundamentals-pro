import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevConfigService } from './common/providers/DevConfigService';
import { portConfig } from './common/constants/connection';
describe('AppController', () => {
  let appController: AppController;
  let devConfigServ: DevConfigService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DevConfigService,
          useClass: DevConfigService,
        },
        {
          provide: 'CONFIG',
          //useValue: { port: '3000' },
          useFactory: () => portConfig,
        },
      ],
    }).compile();
    // obtain the actual provider instance from the compiled module
    devConfigServ = app.get<DevConfigService>(DevConfigService);
    console.log('DB HOST: [', devConfigServ.getDBHOST(), ']');
    appController = await app.resolve<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World! Learning NestJS is fun!"', () => {
      expect(appController.getHello()).toBe(
        `Hello World! Learning NestJS is fun! ${devConfigServ.getDBHOST()}`,
      );
    });
  });
});
