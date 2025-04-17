import { Config, configSchema } from 'src/schemas/config.schema';

const parseIntIfExists = (value: string | undefined) => {
  if (value === undefined) {
    return undefined;
  }
  const parsedValue = parseInt(value);
  return isNaN(parsedValue) ? undefined : parsedValue;
};

const parseBoolean = (value: string | null | undefined) => {
  if (!value) {
    return undefined;
  }
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }
  throw new Error('Invalid boolean value');
};

export function validate(raw: Record<string, unknown>) {
  const env: Config = {
    server: {
      nodeEnv: raw.NODE_ENV as string,
      port: parseInt(raw.PORT as string),
    },
    eventBus: {
      client: {
        clientId: raw.EVENT_BUS_CLIENT_ID as string,
        brokers: ((raw.EVENT_BUS_BROKERS as string | undefined) ?? '')
          .split(',')
          .map((broker) => {
            return broker.trim();
          }),
      },
      consumer: {
        groupId: raw.EVENT_BUS_CONSUMER_GROUP_ID as string,
      },
      dlt: {
        retry: {
          maxAttempts: parseIntIfExists(
            raw.EVENT_BUS_DLT_RETRY_MAX_ATTEMPTS as string,
          ) as number,
          delay: parseIntIfExists(
            raw.EVENT_BUS_DLT_RETRY_DELAY as string,
          ) as number,
        },
      },
    },
    cors: {
      origin: raw.CORS_ORIGIN as string,
    },
    cookie: {
      domain: raw.COOKIE_DOMAIN as string,
      secret: raw.COOKIE_SECRET as string,
    },
    session: {
      name: raw.SESSION_NAME as string,
      timeout: parseInt(raw.SESSION_TIMEOUT as string),
      storage: {
        host: raw.SESSION_STORAGE_HOST as string,
        port: parseInt(raw.SESSION_STORAGE_PORT as string),
        password: raw.SESSION_STORAGE_PASSWORD as string,
      },
    },
    tokenService: {
      url: raw.TOKEN_SERVICE_URL as string,
    },
    mailerService: {
      url: raw.MAILER_SERVICE_URL as string,
      minDelay: raw.MAILER_MIN_DELAY as string,
    },
    auth: {
      local: {
        verifyEmailUrl: raw.VERIFY_EMAIL_URL as string,
      },
      oauth: {
        google: {
          endpoints: {
            token: raw.OAUTH_GOOGLE_ENDPOINT_TOKEN as string,
            profile: raw.OAUTH_GOOGLE_ENDPOINT_PROFILE as string,
            auth: raw.OAUTH_GOOGLE_ENDPOINT_AUTH as string,
          },
          clientId: raw.OAUTH_GOOGLE_CLIENT_ID as string,
          clientSecret: raw.OAUTH_GOOGLE_CLIENT_SECRET as string,
          redirectUris: {
            web: raw.OAUTH_GOOGLE_REDIRECT_URI_WEB as string,
            mobile: raw.OAUTH_GOOGLE_REDIRECT_URI_MOBILE as string,
          },
          grantType: raw.OAUTH_GOOGLE_GRANT_TYPE as string,
        },
        naver: {
          endpoints: {
            token: raw.OAUTH_NAVER_ENDPOINT_TOKEN as string,
            profile: raw.OAUTH_NAVER_ENDPOINT_PROFILE as string,
            auth: raw.OAUTH_NAVER_ENDPOINT_AUTH as string,
          },
          clientId: raw.OAUTH_NAVER_CLIENT_ID as string,
          clientSecret: raw.OAUTH_NAVER_CLIENT_SECRET as string,
          redirectUris: {
            web: raw.OAUTH_NAVER_REDIRECT_URI_WEB as string,
            mobile: raw.OAUTH_NAVER_REDIRECT_URI_MOBILE as string,
          },
          grantType: raw.OAUTH_NAVER_GRANT_TYPE as string,
        },
        kakao: {
          endpoints: {
            token: raw.OAUTH_KAKAO_ENDPOINT_TOKEN as string,
            profile: raw.OAUTH_KAKAO_ENDPOINT_PROFILE as string,
            auth: raw.OAUTH_KAKAO_ENDPOINT_AUTH as string,
          },
          clientId: raw.OAUTH_KAKAO_CLIENT_ID as string,
          clientSecret: raw.OAUTH_KAKAO_CLIENT_SECRET as string,
          redirectUris: {
            web: raw.OAUTH_KAKAO_REDIRECT_URI_WEB as string,
            mobile: raw.OAUTH_KAKAO_REDIRECT_URI_MOBILE as string,
          },
          grantType: raw.OAUTH_KAKAO_GRANT_TYPE as string,
        },
      },
    },
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
