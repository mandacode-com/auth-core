export interface ISession {
  uuidKey: string;
}

declare module 'express-session' {
  interface SessionData extends ISession {}
}
