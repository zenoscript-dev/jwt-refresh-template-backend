import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config(); // used to get process.env access prior to AppModule instanciation

export const getDatabaseNamespaceIds = (): string[] => {
  return process.env.NAMESPACES.split(',');
};

export default registerAs('orm', () => {
  const config = {};

  getDatabaseNamespaceIds().forEach((namespace) => {
    config[namespace] = {
      type: process.env[`${namespace}.DB_TYPE`],
      host: process.env[`${namespace}.DB_HOST`],
      port: parseInt(process.env[`${namespace}.DB_PORT`]),
      username: process.env[`${namespace}.DB_USERNAME`],
      password: process.env[`${namespace}.DB_PASSWORD`],
      database: process.env[`${namespace}.DB_DATABASE`],
      synchronize: true,
      entities: [process.env[`${namespace}.DB_ENTITIES`]],
      logging: true
    };
  });

  console.log(" orm : configf : "+ JSON.stringify(config))

  return config;
});