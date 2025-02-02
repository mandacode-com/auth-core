import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from 'src/services/token.service';

@Module({
  imports: [
    JwtModule.register({
      signOptions: { expiresIn: '1d' },
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
