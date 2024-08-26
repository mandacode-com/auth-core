import { tags } from 'typia';

export interface IConfig {
  nodeEnv: string & tags.Enum<'development' | 'production' | 'test'>;
  port: number;
  corsOrigin: string | RegExp | boolean;
  cookie: ICookieConfig;
  session: ISessionConfig;
  redis: IRedisConfig;
  status: IStatusConfig;
  autoMailer: IAutoMailer;
  jwt: IJwtConfig;
  linkUrl: ILinkUrl;
}

export interface ICookieConfig {
  domain: string;
  secret: string;
}

export interface ISessionConfig {
  name: string;
  timeout: number;
}

export interface IRedisConfig {
  url: string;
}

export interface IStatusConfig {
  localSignin: boolean;
  localSignup: boolean;
}

export interface IAutoMailer {
  host: string;
  port: number;
}

export interface IJwtConfig {
  secret: string;
}

export interface ILinkUrl {
  confirmEmail: string;
}
