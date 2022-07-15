import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({
    schema: {
      properties: {
        service: { type: 'string', example: 'Nest API' },
        status: { type: 'string', example: 'ok' },
      },
    },
  })
  @Public()
  @Get()
  getHealth() {
    return this.appService.getHealth();
  }
}
