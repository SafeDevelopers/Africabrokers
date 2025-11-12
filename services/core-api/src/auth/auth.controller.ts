import { Controller, Post, Body, Get, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { KeycloakService } from './keycloak.service';
import { KeycloakAdminService } from './keycloakAdmin.service';
import { Public } from './public.decorator';

export class AuthCallbackDto {
  code!: string;
  state?: string;
}

export class RoleSelectionDto {
  role!: 'certified_broker' | 'agency' | 'individual_seller' | 'inspector' | 'regulator' | 'admin';
}

export class EmailLoginDto {
  email!: string;
  role?: string;
}

export class PasswordResetDto {
  email!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly keycloakService: KeycloakService,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  @Post('login')
  async login(@Body() dto: EmailLoginDto) {
    return this.authService.loginWithEmail(dto);
  }

  @Post('callback')
  async handleCallback(@Body() dto: AuthCallbackDto) {
    return this.authService.handleOidcCallback(dto.code, dto.state);
  }

  @Post('select-role')
  async selectRole(@Body() dto: RoleSelectionDto, @Req() req: any) {
    return this.authService.selectUserRole(req.user.id, dto.role);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.authService.getUserProfile(req.user.id);
  }

  @Public()
  @Post('password-reset')
  async requestPasswordReset(@Body() dto: PasswordResetDto) {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.keycloakAdminService.findUserByEmail(dto.email);
      if (!user?.id) {
        // Don't reveal if user exists or not (security best practice)
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        };
      }

      await this.keycloakAdminService.executeActionsEmail(user.id, ['UPDATE_PASSWORD']);
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      // Don't reveal if user exists or not (security best practice)
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }
  }
}
