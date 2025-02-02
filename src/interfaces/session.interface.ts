export interface ISession {
  refresh: string;
}

declare module 'express-session' {
  interface SessionData extends ISession {}
}
