export interface ResponseData<T = any> {
  message: string;
  data?: T;
}

export type ResponseError = ResponseData<{
  error: string;
  path: string;
  timestamp: string;
}>;
