import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { UserVerificationCodeService } from '../verification_code/user-verify-code.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';

@Module({
  controllers: [UserController, AdminController],
  providers: [UsersService, UserVerificationCodeService],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
