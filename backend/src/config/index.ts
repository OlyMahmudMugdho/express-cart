import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './configuration';

export const ConfigModule = NestConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validate,
});
