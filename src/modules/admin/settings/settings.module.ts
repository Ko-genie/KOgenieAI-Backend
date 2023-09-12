import { Module } from "@nestjs/common";
import { SettingService } from "./settings.service";
import { SettingController } from "./settings.controller";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { NotificationService } from "src/shared/notification/notification.service";

@Module({
  controllers: [SettingController],
  providers: [SettingService, NotificationService],
  imports: [PrismaModule],
  exports: [SettingService],
})
export class SettingsModule {}