import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthMiddleware } from './jwt-auth.middleware';
import { KeycloakService } from './keycloak.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthMiddleware, KeycloakService],
  exports: [AuthService, JwtAuthMiddleware, KeycloakService],
})
export class AuthModule {}