import { Module } from "@nestjs/common";
import { PrismaModule } from "src/modules/prisma/prisma.module";
import { TemplateController } from "./templates.controller";
import { TemplateService } from "./templates.service";

@Module({
    imports: [PrismaModule],
    controllers: [TemplateController],
    providers:[TemplateService],
    exports:[TemplateService]
})
export class TemplateModule {}
