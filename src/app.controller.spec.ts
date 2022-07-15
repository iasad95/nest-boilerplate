import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('delegates health check to AppService', () => {
    const health = { service: 'Nest API', status: 'ok' };
    const appService: Pick<AppService, 'getHealth'> = {
      getHealth: jest.fn().mockReturnValue(health),
    };

    const controller = new AppController(appService as AppService);

    expect(controller.getHealth()).toEqual(health);
    expect(appService.getHealth).toHaveBeenCalledTimes(1);
  });
});
