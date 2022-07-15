import { IsInt, IsString, Min } from 'class-validator';
import validateConfig from './validate-config';

class TestConfig {
  @IsInt()
  @Min(1)
  APP_PORT: number;

  @IsString()
  APP_NAME: string;
}

describe('validateConfig', () => {
  it('converts compatible values and returns typed config', () => {
    const result = validateConfig(
      {
        APP_PORT: '3000',
        APP_NAME: 'Nest API',
      },
      TestConfig,
    );

    expect(result.APP_PORT).toBe(3000);
    expect(typeof result.APP_PORT).toBe('number');
    expect(result.APP_NAME).toBe('Nest API');
  });

  it('throws when validation fails', () => {
    expect(() =>
      validateConfig(
        {
          APP_PORT: 'invalid-number',
          APP_NAME: 123,
        },
        TestConfig,
      ),
    ).toThrow(Error);
  });
});
