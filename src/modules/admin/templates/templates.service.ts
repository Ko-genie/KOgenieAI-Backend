import { Injectable } from "@nestjs/common";
import { errorResponse, paginatioOptions, paginationMetaData, processException, successResponse } from "src/shared/helpers/functions";
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

      return successResponse('Category is update successfully!', data);
    } catch (error) {
      processException(error);
    }
  }

  async getListCategory(payload: any) {
    try {

      const paginate = await paginatioOptions(payload);

      const categoryList = await this.prisma.templateCategory.findMany({
        ...paginate,
      });

      const paginationMeta = await paginationMetaData(
        'templateCategory',
        payload,
      );

      const data = {
        list: categoryList,
        meta: paginationMeta,
      };

      return successResponse('Category List data', data)
    } catch (error) {
      processException(error)
    }
  }
  async deleteCategory(id: number)
  {
    try {
      const checkCategory = await this.prisma.templateCategory.findFirst({
        where: {
          id: id
        }
      });
      if (checkCategory) {
        await this.prisma.templateCategory.delete({
          where: {
            id: id
          }
        });
      
      return successResponse('Category is deleted successfully!');  
      } else {
        return errorResponse('Category is not found!');
      }
      
    } catch (error) {
      processException(error)
    }
  }
}
