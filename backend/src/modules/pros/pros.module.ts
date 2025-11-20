import { Module } from '@nestjs/common';
import { ProsController } from './pros.controller';
import { ProsService } from './pros.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ProsController],
  providers: [ProsService],
  exports: [ProsService],
})
export class ProsModule {}
