import { tags } from 'typia';

export interface IConfig {
  nodeEnv: string & tags.Enum<'development' | 'production' | 'test'>;
  port: number;
  corsOrigin: string;
  cookie: ICookieConfig;
  session: ISessionConfig;
  redis: IRedisConfig;
}

export interface ICookieConfig {
  secret: string;
}

export interface ISessionConfig {
  secret: string;
  storagePath: string;
}

export interface IRedisConfig {
  url: string;
}
