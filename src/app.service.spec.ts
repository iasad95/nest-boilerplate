import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('returns a healthy service payload', () => {
    expect(service.getHealth()).toEqual({
      service: 'Nest API',
      status: 'ok',
    });
  });
});
