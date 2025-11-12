import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { InviteController } from './invite.controller';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { JwtAuthMiddleware } from './jwt-auth.middleware';
import { KeycloakService } from './keycloak.service';
import { KeycloakAdminService } from './keycloakAdmin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, InviteController, UsersController],
  providers: [AuthService, JwtAuthMiddleware, KeycloakService, KeycloakAdminService],
  exports: [AuthService, JwtAuthMiddleware, KeycloakService, KeycloakAdminService],
})
export class AuthModule {}