import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TrustedOrganizationService } from '../admin/trusted-organization/trusted.service';
import { SettingService } from '../admin/settings/settings.service';
import { NotificationService } from 'src/shared/notification/notification.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [
    PublicService,
    TrustedOrganizationService,
    SettingService,
    NotificationService,
  ],
  exports: [PublicService],
})
export class PublicModule {}
