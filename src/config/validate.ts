import { Config, configSchema } from 'src/schemas/config.schema';

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
    jwt: {
      access: {
        public: raw.JWT_PUBLIC_ACCESS as string,
        private: raw.JWT_PRIVATE_ACCESS as string,
        expiresIn: raw.JWT_EXPIRES_IN_ACCESS as string,
      },
      refresh: {
        public: raw.JWT_PUBLIC_REFRESH as string,
        private: raw.JWT_PRIVATE_REFRESH as string,
        expiresIn: raw.JWT_EXPIRES_IN_REFRESH as string,
      },
      emailVerification: {
        public: raw.JWT_PUBLIC_EMAIL_VERIFICATION as string,
        private: raw.JWT_PRIVATE_EMAIL_VERIFICATION as string,
        expiresIn: raw.JWT_EXPIRES_IN_EMAIL_VERIFICATION as string,
      },
    },
    mailer: {
      url: raw.AUTO_MAILER_URL as string,
      minDelay: raw.AUTO_MAILER_MIN_DELAY as string,
    },
    urls: {
      verifyEmail: raw.VERIFY_EMAIL_URL as string,
    },
    servicesStatus: {
      auth: {
        local: {
          signup: parseBoolean(
            raw.SERVICE_AUTH_LOCAL_SIGNUP as string,
          ) as boolean,
          login: parseBoolean(
            raw.SERVICE_AUTH_LOCAL_LOGIN as string,
          ) as boolean,
          verifyEmail: parseBoolean(
            raw.SERVICE_AUTH_LOCAL_VERIFY_EMAIL as string,
          ) as boolean,
          resend: parseBoolean(
            raw.SERVICE_AUTH_LOCAL_RESEND as string,
          ) as boolean,
        },
      },
      session: {
        check: parseBoolean(raw.SERVICE_SESSION_CHECK as string) as boolean,
        destroy: parseBoolean(raw.SERVICE_SESSION_DESTROY as string) as boolean,
      },
      token: {
        refresh: parseBoolean(raw.SERVICE_TOKEN_REFRESH as string) as boolean,
      },
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
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
