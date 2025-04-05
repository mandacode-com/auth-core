import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProvider,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { join } from 'path';
import { TOKEN_PACKAGE_NAME, TOKEN_SERVICE_NAME } from 'src/protos/token';
import { Config } from 'src/schemas/config.schema';
import { TokenService } from 'src/services/token.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: TOKEN_SERVICE_NAME,
        useFactory: (config: ConfigService<Config, true>) => {
          const provider: ClientProvider = {
            transport: Transport.GRPC,
            options: {
              package: TOKEN_PACKAGE_NAME,
              protoPath: join(__dirname, '../protos/token.proto'),
              url: config.get('tokenService', { infer: true }).url,
            },
          };
          return provider;
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenServiceModule {}
