export interface ISession {
  uuid: string;
}

declare module 'express-session' {
  interface SessionData extends ISession {}
}
