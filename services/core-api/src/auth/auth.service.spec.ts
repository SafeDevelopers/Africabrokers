import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';

describe('AuthService - loginWithEmail', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  const service = new AuthService(prisma as any);

  const JWT_SECRET = 'test-secret';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('issues a JWT when credentials are valid', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'broker@example.com',
      role: 'BROKER',
      tenantId: 'tenant-1',
      authProviderId: 'Broker Example',
      tenant: {
        id: 'tenant-1',
        slug: 'et-addis',
        name: 'AfriBrok Addis',
      },
    });

    const result = await service.loginWithEmail({ email: 'broker@example.com', role: 'BROKER' });

    expect(result.user.id).toBe('user-123');
    expect(result.tenant?.slug).toBe('et-addis');

    const payload = jwt.verify(result.token, JWT_SECRET) as jwt.JwtPayload;
    expect(payload.sub).toBe('user-123');
    expect(payload.role).toBe('BROKER');
    expect(payload.tenantId).toBe('tenant-1');
  });

  it('throws when user cannot be found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.loginWithEmail({ email: 'missing@example.com', role: 'BROKER' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
