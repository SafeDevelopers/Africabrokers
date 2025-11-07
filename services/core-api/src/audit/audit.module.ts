import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLoggingMiddleware } from './audit-logging.middleware';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuditService, AuditLoggingMiddleware],
  exports: [AuditService, AuditLoggingMiddleware],
})
export class AuditModule {}

