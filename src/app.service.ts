import { Inject, Injectable } from '@nestjs/common';
import { DevConfigService } from './common/providers/DevConfigService';

@Injectable()
export class AppService {
  constructor(
    private readonly devConfigServ: DevConfigService,
    @Inject('CONFIG')
    private readonly config: { port: string },
  ) {}
  getHello(): string {
    return `Hello World! Learning NestJS is fun! ${this.devConfigServ.getDBHOST()}`; //  Port: ${this.config.port}
  }
}
