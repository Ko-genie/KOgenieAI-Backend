import { Injectable } from "@nestjs/common";
import { errorResponse, processException, successResponse } from "src/shared/helpers/functions";
import { AddNewCategoryDto } from "./dto/add-new-category.dto";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class TemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async addNewCategory(payload: AddNewCategoryDto) {
    try {
      const checkNameUnique = await this.prisma.templateCategory.findFirst({
        where: {
          name: {
            contains: payload.name,
          },
        },
      });
      if (checkNameUnique) {
        return errorResponse('This category is already has!');
      }
      const data = await this.prisma.templateCategory.create({
        data: {
          ...payload,
        },
      });

      return successResponse('Category is added successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async updateCategory(payload: UpdateCategoryDto) {
    try {
      const checkNameUnique = await this.prisma.templateCategory.findFirst({
        where: {
          id: {
            not:payload.id
          },
          name: {
            contains: payload.name,
          },
        },
      });

      if (checkNameUnique) {
        return errorResponse('This category is already has!');
      }
      const {name, description } = payload;
      const data = await this.prisma.templateCategory.update({
        where: {
          id:payload.id
        }, data: {
          name,
          description
        }
      });

      return successResponse('Category is added successfully!', data);
    } catch (error) {
      processException(error);
    }
  }
}
