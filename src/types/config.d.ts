import { tags } from 'typia';

export interface IConfig {
  nodeEnv: string & tags.Enum<'development' | 'production' | 'test'>;
  port: number;
  corsOrigin: string;
  cookie: ICookieConfig;
  session: ISessionConfig;
  redis: IRedisConfig;
  status: IStatusConfig;
}

export interface ICookieConfig {
  secret: string;
}

export interface ISessionConfig {
  name: string;
  secret: string;
  storagePath: string;
  timeout: number;
}

export interface IRedisConfig {
  url: string;
}

export interface IStatusConfig {
  localSignin: boolean;
  localSignup: boolean;
}
