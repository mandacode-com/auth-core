export interface ResponseData<T = unknown> {
  message: string;
  data?: T;
}

export type ResponseError = ResponseData<{
  error: string;
  path: string;
  timestamp: string;
}>;
