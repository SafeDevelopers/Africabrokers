import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentIntentService } from './services/payment-intent.service';
import { SubscriptionService } from './services/subscription.service';
import { InvoiceService } from './services/invoice.service';
import { ProviderRegistry } from './services/provider-registry.service';
import { StripeAdapter } from './adapters/stripe.adapter';
import { TelebirrAdapter } from './adapters/telebirr.adapter';
import { MpesaAdapter } from './adapters/mpesa.adapter';
import { CashAdapter } from './adapters/cash.adapter';
import { BillingController } from './billing.controller';
import { AdminBillingController } from './admin-billing.controller';
import { SuperAdminBillingController } from './superadmin-billing.controller';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    BillingController,
    AdminBillingController,
    SuperAdminBillingController,
    WebhooksController,
  ],
  providers: [
    PaymentIntentService,
    SubscriptionService,
    InvoiceService,
    ProviderRegistry,
    StripeAdapter,
    TelebirrAdapter,
    MpesaAdapter,
    CashAdapter,
  ],
  exports: [
    PaymentIntentService,
    SubscriptionService,
    InvoiceService,
    ProviderRegistry,
  ],
})
export class BillingModule {}

