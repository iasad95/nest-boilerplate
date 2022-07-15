import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'Nest API',
      status: 'ok',
    };
  }
}
