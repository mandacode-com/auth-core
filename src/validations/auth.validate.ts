import { ISigninBody, ISignupBody } from 'src/types/auth';
import { createValidate } from 'typia';

export const validateSignupBody = createValidate<ISignupBody>();
export const validateSigninBody = createValidate<ISigninBody>();
