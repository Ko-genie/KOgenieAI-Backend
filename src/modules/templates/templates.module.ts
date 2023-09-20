import { Module } from "@nestjs/common";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { AdminTemplateController } from './admin-templates.controller';
import { TemplateService } from "./templates.service";
import { UserTemplateController } from "./user-templates.controller";

@Module({
  imports: [PrismaModule],
  controllers: [AdminTemplateController, UserTemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
