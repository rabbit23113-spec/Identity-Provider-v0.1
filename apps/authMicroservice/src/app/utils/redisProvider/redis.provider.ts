import Redis from 'ioredis';
import { constants } from '../../constants/app.constants';

export const RedisProvider = {
  provide: constants.REDIS_PROVIDER,
  useFactory: () => {
    return new Redis({
      host: 'redis',
      port: 6379,
    });
  },
};
