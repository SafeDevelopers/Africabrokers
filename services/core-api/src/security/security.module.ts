import { Global, Module } from '@nestjs/common';
import { IdorGuard } from './idor.guard';

@Global()
@Module({
  providers: [IdorGuard],
  exports: [IdorGuard],
})
export class SecurityModule {}

