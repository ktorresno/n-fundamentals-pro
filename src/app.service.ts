import { Inject, Injectable } from '@nestjs/common';
import { DevConfigService } from './common/providers/DevConfigService';

@Injectable()
export class AppService {
  constructor(
    private readonly devConfigServ: DevConfigService,
    @Inject('PORT_CONFIG')
    private readonly config: { port: number },
  ) {}
  getHello(): string {
    return `Hello World! Learning NestJS is fun! Host: ${this.devConfigServ.getDBHOST()} Port: ${this.config.port}`; //  Port: ${this.config.port}
  }
}
