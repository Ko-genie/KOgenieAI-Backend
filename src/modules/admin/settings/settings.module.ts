import { Module } from "@nestjs/common";
import { SettingService } from "./settings.service";
import { SettingController } from "./settings.controller";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { NotificationService } from "src/shared/notification/notification.service";
import { AdminProgramingLanguageController } from "../admin-dashboard/programing-language/admin-programing-language.controller";
import { ProgramingLanguageService } from "../admin-dashboard/programing-language/programing-language.service";

@Module({
  controllers: [SettingController, AdminProgramingLanguageController],
  providers: [SettingService, NotificationService, ProgramingLanguageService],
  imports: [PrismaModule],
  exports: [SettingService, ProgramingLanguageService],
})
export class SettingsModule {}