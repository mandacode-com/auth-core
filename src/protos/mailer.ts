// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v6.30.1
// source: mailer.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "mailer";

export enum MailType {
  VERIFY_EMAIL = 0,
  PASSWORD_RESET = 1,
  UNRECOGNIZED = -1,
}

export interface SendEmailRequest {
  type: MailType;
  to: string;
  subject: string;
  verification?: EmailVerificationRequest | undefined;
  passwordReset?: PasswordResetRequest | undefined;
}

export interface EmailVerificationRequest {
  link: string;
}

export interface PasswordResetRequest {
  link: string;
}

export interface SendEmailResponse {
}

export const MAILER_PACKAGE_NAME = "mailer";

export interface MailerServiceClient {
  sendEmail(request: SendEmailRequest): Observable<SendEmailResponse>;
}

export interface MailerServiceController {
  sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> | Observable<SendEmailResponse> | SendEmailResponse;
}

export function MailerServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["sendEmail"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("MailerService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("MailerService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const MAILER_SERVICE_NAME = "MailerService";
