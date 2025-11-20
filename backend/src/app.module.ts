import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProsModule } from './modules/pros/pros.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
// import { ContractsModule } from './modules/contracts/contracts.module';
// import { PaymentsModule } from './modules/payments/payments.module';
// import { ReviewsModule } from './modules/reviews/reviews.module';
// import { SearchModule } from './modules/search/search.module';
// import { MessagingModule } from './modules/messaging/messaging.module';
// import { AdminModule } from './modules/admin/admin.module';
import { FilesModule } from './modules/files/files.module';
// import { NotificationsModule } from './modules/notifications/notifications.module';
// import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // BullMQ for background jobs
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_URL?.split('//')[1]?.split(':')[0] || 'localhost',
        port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
      },
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    ProsModule,
    CategoriesModule,
    JobsModule,
    ProposalsModule,
    // ContractsModule,
    // PaymentsModule,
    // ReviewsModule,
    // SearchModule,
    // MessagingModule,
    // AdminModule,
    FilesModule,
    // NotificationsModule,
    // AuditModule,
  ],
})
export class AppModule {}
