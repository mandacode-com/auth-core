import { Module } from '@nestjs/common';
import { LocalController } from 'src/controllers/local.controller';
import { PrismaService } from 'src/services/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthLocalService } from 'src/services/auth/local.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTO_MAILER',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTO_MAILER_HOST,
          port: parseInt(process.env.AUTO_MAILER_PORT!),
        },
      },
    ]),
    JwtModule.register({
      signOptions: { expiresIn: '1d' },
      secret: process.env.JWT_SECRET,
      global: true,
    }),
    PrismaModule,
  ],
  controllers: [LocalController],
  providers: [AuthLocalService, PrismaService],
})
export class AuthLocalModule {}
