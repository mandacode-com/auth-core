import { IConfig } from 'src/types/config';
import { createValidate } from 'typia';

export const validateConfig = createValidate<IConfig>();
