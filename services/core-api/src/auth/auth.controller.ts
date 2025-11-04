import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
