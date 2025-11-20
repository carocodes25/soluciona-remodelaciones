import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProposalsController } from './proposals.controller';
import { ProposalsService } from './proposals.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
